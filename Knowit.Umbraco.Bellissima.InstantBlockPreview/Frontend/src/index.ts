import { LitElement, html, customElement, unsafeHTML} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { debounce } from "@umbraco-cms/backoffice/utils";

@customElement('knowit-instant-block-preview')
export class InstantBlockPreview extends UmbElementMixin(LitElement) {

  #contentVals : any |undefined = undefined;
  #currentValue : any | undefined = undefined;
  #currentId : UmbWorkspaceUniqueType | undefined = undefined;
  #propertyType: string | undefined = undefined;
  #documentTypeId: string | undefined = undefined;
  #label: string | undefined = undefined;
  #loader = `<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...`;
  #showLoader = false;
  #htmlOutput = ``;
  #areas: any | undefined = undefined;

  constructor() {
    super();

    this.#contentVals = {};
    this.#htmlOutput = this.blockBeam();

    // currently not exposed by the context-api, so we need to create our own
    const UMB_BLOCK_GRID_ENTRY_CONTEXT = new UmbContextToken<any>('UmbBlockEntryContext')
    const UMB_BLOCK_LIST_ENTRY_CONTEXT = new UmbContextToken<any>('UmbBlockEntryContext');

    // fetch id and type-id from the document
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext.getUnique();
      this.#documentTypeId = workspaceContext.getContentTypeId();
    });


    this.consumeContext(UMB_PROPERTY_CONTEXT, (propertyContext) => {
      this.#propertyType = propertyContext.getAlias();
    
      // handle block grid
      this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (context) => {
        
        // fetch the label of the block and init the blockbeam with the label
        this.observe(context.label, (label) => {
          this.#label = label as string;
          this.#htmlOutput = this.blockBeam();
          this.requestUpdate();
        });
        
        // handle the block whenever content or value change
        this.observe(observeMultiple(context.content, propertyContext.value), ([content, currentValue]) => {
          this.handleBlock(content, currentValue);
        });

        // handle areas
        if(context.areas) {
          this.observe(context.areas, areas => {
            this.#areas = areas;
          });
        }
      });
      
      // handle block list
      this.consumeContext(UMB_BLOCK_LIST_ENTRY_CONTEXT, (context) => {
        this.observe(context.label, (label) => {
          this.#label = label as string;
          this.#htmlOutput = this.blockBeam();
          this.requestUpdate();
        });

        this.observe(observeMultiple(context.content, propertyContext.value), ([content, currentValue]) => {
          this.handleBlock(content, currentValue);
        });
      });
    });
  }

  handleBlock(content : any, currentValue : any) {
    this.#showLoader = true;
    
    if(!currentValue) return;
    // make them mutable
    const obj = JSON.parse(JSON.stringify(currentValue));
    content = JSON.parse(JSON.stringify(content));
    
    // only process if the content has changed
    if(this.#contentVals[content.udi] && JSON.stringify(this.#contentVals[content.udi]) === JSON.stringify(content)) {
      return;
    }
    

    this.#contentVals[content.udi] = content;
    
    const index = obj.contentData.findIndex((f: { udi: any; }) => f.udi == content.udi);
    
    // the frontend outputs picker-values differently than what the backend expects
    // so we need to convert them to the correct format
    // a bit ugly, but we detect a picker by it having a type and unique property, and only that
    for (const key in content) {
      if (Array.isArray(content[key])) {
          let allItemsAreValid = content[key].every(item => item && typeof item.type === 'string' && typeof item.unique === 'string');
  
          if (allItemsAreValid) {
              for (let i = 0; i < content[key].length; i++) {
                  const newItem = `umb://${content[key][i].type}/${content[key][i].unique}`;
                  content[key][i] = newItem;
              }
              content[key] = content[key].join(',');
          }
      }
    }
    
    obj.contentData[index] = content;
    obj.target = content.udi;
      
    this.#currentValue = obj;

    const payload = {
      content: JSON.stringify(this.#currentValue),
      contentId: this.#currentId,
      propertyTypeAlias: this.#propertyType,
      contentTypeId: this.#documentTypeId,
    }

    fetch('/api/blockpreview', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json()).then(data => {
      
      this.#showLoader = false;
      if(data.html === "blockbeam")
        this.#htmlOutput = this.blockBeam();  
      else {
        const containsRenderGridAreaSlots = data.html.includes("###renderGridAreaSlots");
        if(containsRenderGridAreaSlots) {
          const areaHtml = this.areas();
          data.html = data.html.replace("###renderGridAreaSlots", areaHtml);
        }

        this.#htmlOutput = '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">' + data.html + '</div>';
      }
      this.requestUpdate();

      
      const debouncedScriptParser = debounce(() => {
        this.manageScripts();
      }, 100);
  
      debouncedScriptParser();
    });

  }

  manageScripts() {
    const scripts = this.shadowRoot?.querySelectorAll('script');
    scripts?.forEach(oldScript => {
      const newScript = document.createElement('script');

      // Copy attributes from old script to new script
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy the inline script content
      if (oldScript.src) {
        // If the script has a src attribute, set it to the new script
        newScript.src = oldScript.src;
      } else {
        // Otherwise, set the inline script content
        newScript.textContent = oldScript.textContent;
      }

      // Append the new script to the same parent node
      oldScript?.parentNode?.replaceChild(newScript, oldScript);
    });
  }

  areas() {
    // todo, fix href
    return this.#areas && this.#areas.length > 0
    ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${this.#label}</span> ${this.#showLoader ? this.#loader : ''}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `
    : '';

  }

  blockBeam() {
    // todo, fix href
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${this.#label}</span> ${this.#showLoader ? this.#loader : ''}
		</umb-ref-grid-block>`
  }

  render() {
    return html`${unsafeHTML(this.#htmlOutput)}`;
  }
}

export default InstantBlockPreview;

declare global {
  interface HTMLElementTagNameMap {
    'knowit-instant-block-preview': InstantBlockPreview;
  }
}
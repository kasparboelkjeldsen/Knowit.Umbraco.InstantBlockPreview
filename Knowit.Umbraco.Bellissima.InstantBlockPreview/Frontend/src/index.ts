import { LitElement, html, customElement, unsafeHTML} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";

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
    const UMB_BLOCK_GRID_ENTRY_CONTEXT = new UmbContextToken<any>('UmbBlockEntryContext')
    const UMB_BLOCK_LIST_ENTRY_CONTEXT = new UmbContextToken<any>('UmbBlockEntryContext');

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext.getUnique();
      this.#documentTypeId = workspaceContext.getContentTypeId();
    });

    this.consumeContext(UMB_PROPERTY_CONTEXT, (propertyContext) => {
      this.#propertyType = propertyContext.getAlias();
    
      this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (context) => {
        this.observe(context.label, (label) => {
          this.#label = label as string;
          this.#htmlOutput = this.blockBeam();
          this.requestUpdate();
        });
        
        this.observe(observeMultiple(context.content, propertyContext.value, context.areas), ([content, currentValue]) => {
          
          this.handleBlock(content, currentValue);
        });

        // handle areas
        if(context.areas) {
          this.observe(context.areas, areas => {
            this.#areas = areas;
          });
        }
        
      });

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
    const obj = JSON.parse(JSON.stringify(currentValue));
    content = JSON.parse(JSON.stringify(content));
    
    //obj.contentData = [content];
    

    if(this.#contentVals[content.udi] && JSON.stringify(this.#contentVals[content.udi]) === JSON.stringify(content)) {
      return;
    }
    
    this.#contentVals[content.udi] = content;
    
    const index = obj.contentData.findIndex((f: { udi: any; }) => f.udi == content.udi);
    
    if(content.picker) {
      for(let i = 0; i < content.picker.length; i++) {
        const newPicker = `umb://${content.picker[i].type}/${content.picker[i].unique}`;
        content.picker[i] = newPicker;
      }
     
      content.picker = content.picker.join(',');
    }

    console.log('content',content)

    obj.contentData[index] = content;

    

    //console.log(obj.contentData, content.udi)
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
    });

  }

  areas() {
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
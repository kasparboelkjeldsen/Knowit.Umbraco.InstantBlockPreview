import { LitElement, html, customElement, unsafeHTML, css, TemplateResult} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT } from '@umbraco-cms/backoffice/block-grid';
import { UMB_BLOCK_LIST_ENTRY_CONTEXT } from '@umbraco-cms/backoffice/block-list';
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { DocumentTypeService, DataTypeService, DataTypeResponseModel } from "../api";

import '@umbraco-cms/backoffice/ufm';
import { UmbBlockDataType } from "@umbraco-cms/backoffice/block";

@customElement('knowit-instant-block-preview')
export class InstantBlockPreview extends UmbElementMixin(LitElement) {

  
  
  #propertyType: string | undefined;
  #settings: any | undefined = undefined;
  #currentSettings: UmbBlockDataType | undefined;
  #currentContent: UmbBlockDataType | undefined;
  #currentValue: any | undefined;
  #blockType: string | undefined = undefined;
  #currentId : UmbWorkspaceUniqueType | undefined = undefined;
  #documentTypeId: string | undefined = undefined;
  #contentElementTypeKey : string | undefined = undefined;
  #settingsElementTypeKey : string | null | undefined;
  #label: string | undefined = undefined;
  #loader = `Loading preview...`;
  #showLoader = false;
  #htmlOutput : TemplateResult | undefined = undefined;
  
  #content: any | undefined = undefined;

  #contentTypeKey: string | undefined;

  #contentCache: Map<any,any> | undefined = undefined;
  static typeKeys: string[] = [];
  static typeDefinitions: { [editorAlias: string]: DataTypeResponseModel } = {};

  static override styles = css`
  .kibp_content.hidden {
    height: 0;
    overflow:hidden;
  }

  .kibp_defaultDivStyle {
    border: 1px solid var(--uui-color-border,#d8d7d9);
    min-height: 50px; box-sizing: border-box;
  }

  #kibp_collapsible:hover .kibp_collaps {
    height: 25px;
  }
  .kibp_collaps {
      height: 0px;
      width: 150px;
      background-color: #1b264f;
      transition: all ease 0.4s;
      color: white;
      font-weight: bold;
      position: absolute;
      top: 0;
      font-size: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      opacity: 0.8;
      cursor: pointer;
  }
      .kibp_collaps span {
        margin-left: 10px;
      }

.kibp_collaps .active {
    display: none;
}

.kibp_collaps.active {
    background-color: #86a0ff;
    height: 50px !important;
    width: 100%;
    position: initial;
}

    .kibp_collaps.active .inactive {
        display: none;
    }

    .kibp_collaps.active .active {
        display: inline;
    }
  `


  constructor() {
    super();
    this.#contentCache = new Map();
    this.#htmlOutput = this.blockBeam();

    this.init();
  }

  async init() {
    this.#settings = await fetch('/api/blockpreview');
    
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext.getUnique();
      this.#documentTypeId = workspaceContext.getContentTypeId();
    });
    let editorNode = "";
    this.consumeContext(UMB_PROPERTY_CONTEXT, (propertyContext) => {
      this.#propertyType = propertyContext.getAlias();
      
      
      
      this.observe(propertyContext.value, (value) => {
        this.#currentValue = value;
        this.handleBlock();
      });

      this.observe(propertyContext.editor, (editor) => {
        editorNode = editor?.tagName ?? "";
      });
    });

    console.log('editor1',editorNode);
    this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, async (context) => {
      this.#blockType = 'grid';
      
      if(editorNode == "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST") return;

      
      this.#label = context.getLabel();
      this.#htmlOutput = this.blockBeam();
      this.requestUpdate();
      
      this.observe(context.contentTypeKey, (contentTypeKey) => {
        this.#contentTypeKey = contentTypeKey;
      });

      this.observe(context.contentElementTypeKey, (contentKey) => {
        this.#contentElementTypeKey = contentKey;
      });

      this.observe(context.settingsElementTypeKey, (contentKey) => {
        this.#settingsElementTypeKey = contentKey;
      });
      // Use a separate array for the promises, await their resolution with Promise.all()
      await this.GetDataTypes();

      context.settingsValues().then(async (settings) => {
        this.observe(settings, async (settings) => {
          this.#currentSettings = settings;
          this.handleBlock();
        });
      });

      context.contentValues().then(async (blockContent) => {
        this.observe(blockContent, async (content) => {
          this.#currentContent = content;
          this.handleBlock();
        });
      });
    });

    this.consumeContext(UMB_BLOCK_LIST_ENTRY_CONTEXT, async (context) => {
      
      this.#blockType = 'list';

      if(editorNode != "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST") return;

      this.#label = context.getLabel();
      this.#htmlOutput = this.blockBeam();
      this.requestUpdate();
      
      this.observe(context.contentTypeKey, (contentTypeKey) => {
        this.#contentTypeKey = contentTypeKey;
      });

      this.observe(context.contentElementTypeKey, (contentKey) => {
        this.#contentElementTypeKey = contentKey;
      });

      this.observe(context.settingsElementTypeKey, (contentKey) => {
        this.#settingsElementTypeKey = contentKey;
      });
      // Use a separate array for the promises, await their resolution with Promise.all()
      await this.GetDataTypes();

      context.settingsValues().then(async (settings) => {
        this.observe(settings, async (settings) => {
          this.#currentSettings = settings;
          this.handleBlock();
        });
      });

      context.contentValues().then(async (blockContent) => {
        this.observe(blockContent, async (content) => {
          this.#currentContent = content;
          this.handleBlock();
        });
      });
    });
      
  }

  MarryContentAndValue(content :UmbBlockDataType, values: any) {
    const mutableContent = JSON.parse(JSON.stringify(content));

    values.forEach((v: { alias: string | number; value: any; }) => {
      mutableContent[v.alias] = v.value;
    });
    return mutableContent as UmbBlockDataType;
  }
  async fetchBlockPreview(payload : any) {
    if(this.#contentCache === undefined) this.#contentCache = new Map();
    // Convert the payload to a string to use as a key in the cache
    const payloadKey = JSON.stringify(payload);

    // Check if we have a cached response for the same payload
    if (this.#contentCache.has(payloadKey)) {
      return this.#contentCache.get(payloadKey); // Return the cached response
    }

    // If no cached response, make the network request
    const response = await fetch('/api/blockpreview', {
      method: 'POST',
      body: payloadKey, // Reuse the stringified payload
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Cache the response using the payload as the key
    this.#contentCache.set(payloadKey, data);

    // Return the response data
    return data;
  }
  async handleBlock() {
    
    this.#showLoader = true;
    
    if(this.#currentContent == null) return;

    const content = this.#currentContent;
    const settings = this.#currentSettings;
    
    const marriedContent = this.MarryContentAndValue(content, this.#currentValue.contentData.find((x: { contentTypeKey: string | undefined; }) => x.contentTypeKey === this.#contentTypeKey).values);
    const marriedSettings = settings ? this.MarryContentAndValue(content, this.#currentValue.settingsData.find((x: { contentTypeKey: string | undefined; }) => x.contentTypeKey === this.#contentTypeKey).values) : settings;

    const goodContent = this.parseBadKeys(marriedContent);
    const goodSettings = settings ? this.parseBadKeys(marriedSettings) : settings;
    
    

    const payload = {
      content: JSON.stringify(goodContent),
      settings: JSON.stringify(goodSettings),
      contentId: this.#currentId,
      propertyTypeAlias: this.#propertyType,
      contentTypeId: this.#documentTypeId,
      contentElementTypeKey: this.#contentElementTypeKey,
      settingsElementTypeKey: this.#settingsElementTypeKey,
      blockType: this.#blockType,
    }


    const data = await this.fetchBlockPreview(payload);
    this.#showLoader = false;
    if(data.html === "blockbeam")
      this.#htmlOutput = this.blockBeam();  
    else {

        const containsRenderGridAreaSlots = data.html.includes("###renderGridAreaSlots");
        const divStyle = this.#settings.divInlineStyle ? `style="${this.#settings.divInlineStyle}"` : "";
        if(containsRenderGridAreaSlots) {
          const areaHtml = this.areas();
          data.html = data.html.replace("###renderGridAreaSlots", areaHtml);
          this.#htmlOutput = html`
            <div class="kibp_defaultDivStyle" ${divStyle}>
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                ${unsafeHTML(data.html)}
                </div>
              </div>
            </div>`;
        }
        else {
          this.#htmlOutput = html`
            <div class="kibp_defaultDivStyle" ${divStyle}>
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${unsafeHTML(data.html)}
                  </div>
                </div>
              </div>
            </div>`;
        }
    }
    this.requestUpdate();
    
    const debouncedScriptParser = debounce(() => {
      this.manageScripts();
      
      
      const collaps = this.shadowRoot?.querySelector('.kibp_collaps');
      const contentElement = this.shadowRoot?.querySelector('.kibp_content');

      if(this.#settings.collapsibleBlocks) {
        collaps?.addEventListener('click', (e) => {
          
          collaps.classList.toggle('active');
          
          contentElement?.classList.toggle('hidden');
          e.preventDefault();
          e.stopImmediatePropagation();
        });
      }
      else {
        collaps?.classList.remove('kibp_collaps');
        collaps?.remove();
      }
    }, 100);

    debouncedScriptParser();
  }

  private async GetDataTypes() {
    const documentType = await DocumentTypeService.getDocumentTypeById({ id: this.#contentTypeKey as string });

    const propertyPromises = documentType.properties.map(async (property) => {
      const dataTypeId = property.dataType.id;

      // Check if the dataType is already in typeDefinitions
      let editorAlias = InstantBlockPreview.typeKeys.find(alias => InstantBlockPreview.typeDefinitions[alias]?.id === dataTypeId);

      if (!editorAlias) {
        // If not cached, fetch it
        const dataType = await DataTypeService.getDataTypeById({ id: dataTypeId });
        editorAlias = dataType.editorAlias;

        // Add the fetched dataType to both arrays, ensure the push is synchronous
        InstantBlockPreview.typeKeys.push(this.#contentTypeKey as string);
        InstantBlockPreview.typeDefinitions[property.alias] = dataType;
      }

      return editorAlias;
    });

    // Await for all properties to be processed
    await Promise.all(propertyPromises);
  }

  parseBadKeys(content: UmbBlockDataType | undefined) {
    const mutableContent = JSON.parse(JSON.stringify(content));
    for (const key in mutableContent) {
      
      const value = mutableContent[key];
      

      const editorAlias = InstantBlockPreview.typeDefinitions[key]?.editorAlias;
      
      if(editorAlias) {
        switch(editorAlias) {
          case "Umbraco.Tags":
            mutableContent[key] = JSON.stringify(value);
          break;
          case "Umbraco.Decimal":
            mutableContent[key] = JSON.stringify(value);
            break;
          case "Umbraco.ContentPicker":
            const newItem = `umb://document/${value}`;
            mutableContent[key] = newItem;
          break;
          case "Umbraco.DropDown.Flexible": 
          mutableContent[key] = JSON.stringify(value);
          break;
          case "Umbraco.CheckBoxList": 
          mutableContent[key] = JSON.stringify(value);
          break;

          case "Umbraco.MultipleTextstring": 
          mutableContent[key] = value.join('\n');
          break;
          case "Umbraco.MultiNodeTreePicker": 
            for (let i = 0; i < mutableContent[key].length; i++) {
              const newItem = `umb://${mutableContent[key][i].type}/${mutableContent[key][i].unique}`;
              mutableContent[key][i] = newItem;
            }
            mutableContent[key] = mutableContent[key].join(',');
          break;
        }
      }
    }
    return mutableContent as UmbBlockDataType;
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
    return`
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${this.#label}</span> ${this.#showLoader ? this.#loader : ''}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `;

  }

  blockBeam() {
    // todo, fix href
    return html`
    <umb-ref-grid-block standalone href="">
      <umb-ufm-render inline .markdown=${this.#label} .value=${this.#content}></umb-ufm-render>
      ${this.#showLoader ? this.#loader : ''}
		</umb-ref-grid-block>`
  }

  render() {
    return html`${this.#htmlOutput}`;
  }
}

export default InstantBlockPreview;

declare global {
  interface HTMLElementTagNameMap {
    'knowit-instant-block-preview': InstantBlockPreview;
  }
}
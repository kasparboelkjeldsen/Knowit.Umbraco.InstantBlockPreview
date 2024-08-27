import { LitElement, html, customElement, unsafeHTML, css} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { DocumentTypeService, DataTypeService } from "../api";


@customElement('knowit-instant-block-preview')
export class InstantBlockPreview extends UmbElementMixin(LitElement) {

  #settings: any | undefined = undefined;
  #contentVals : any |undefined = undefined;
  #definitions: any | undefined = undefined;
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
    this.#definitions = {};
    this.#settings = {};
    this.#htmlOutput = this.blockBeam();

    fetch('/api/blockpreview').then(response => response.json()).then(data => {
      this.#settings = data;
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
            const anyContent = content as any;

            if (this.#definitions[anyContent.contentTypeKey] === undefined) {
              DocumentTypeService.getDocumentTypeById({ id: anyContent.contentTypeKey }).then((response) => {
                // Create an array of promises for all DataTypeService.getDataTypeById calls
                const promises = response.properties.map((prop) => {
                  return DataTypeService.getDataTypeById({ id: prop.dataType.id }).then((dataType) => {
                    this.#definitions[prop.alias] = dataType.editorAlias;
                  });
                });

                // Use Promise.all to wait for all DataTypeService.getDataTypeById promises to resolve
                Promise.all(promises).then(() => {
                  // All datatypes are loaded, now handle the block
                  this.handleBlock(anyContent, currentValue);
                });
              });
            } else {
              this.handleBlock(anyContent, currentValue);
            }

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
            
            const anyContent = content as any;

            if (this.#definitions[anyContent.contentTypeKey] === undefined) {
              DocumentTypeService.getDocumentTypeById({ id: anyContent.contentTypeKey }).then((response) => {
                // Create an array of promises for all DataTypeService.getDataTypeById calls
                const promises = response.properties.map((prop) => {
                  return DataTypeService.getDataTypeById({ id: prop.dataType.id }).then((dataType) => {
                    this.#definitions[prop.alias] = dataType.editorAlias;
                  });
                });
            
                // Use Promise.all to wait for all DataTypeService.getDataTypeById promises to resolve
                Promise.all(promises).then(() => {
                  // All datatypes are loaded, now handle the block
                  this.handleBlock(anyContent, currentValue);
                });
              });
            } else {
              this.handleBlock(anyContent, currentValue);
            }
            
          });
        });
      });
    });

    
  }

  parseBadKeys(content: any) {
    for (const key in content) {
      const value = content[key];
      const editorAlias = this.#definitions[key];
      
      if(editorAlias) {
        switch(editorAlias) {
          case "Umbraco.Tags":
            content[key] = JSON.stringify(value);
          break;
          case "Umbraco.ContentPicker":
            const newItem = `umb://document/${value}`;
            content[key] = newItem;
          break;
          case "Umbraco.DropDown.Flexible": 
            content[key] = JSON.stringify(value);
          break;
          case "Umbraco.CheckBoxList": 
            content[key] = JSON.stringify(value);
          break;

          case "Umbraco.MultipleTextstring": 
            content[key] = value.join('\n');
          break;
          case "Umbraco.MultiNodeTreePicker": 
            for (let i = 0; i < content[key].length; i++) {
              const newItem = `umb://${content[key][i].type}/${content[key][i].unique}`;
              content[key][i] = newItem;
            }
            content[key] = content[key].join(',');
          break;
        }
      }
    }
    return content;
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
    
    obj.contentData[index] = content;
    obj.target = content.udi;
    

    for(let i = 0; i < obj.settingsData.length; i++) {
      obj.settingsData[i] = this.parseBadKeys(obj.settingsData[i]);
    }

    for(let i = 0; i < obj.contentData.length; i++) {
      obj.contentData[i] = this.parseBadKeys(obj.contentData[i]);
    }
    
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
          this.#htmlOutput = `
            <div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                  ${data.html}
                </div>
              </div>
            </div>`;
        }
        else {
          this.#htmlOutput = `
            <div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${data.html}
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
    });

  }


  static override styles = css`
  .kibp_content.hidden {
    height: 0;
    overflow:hidden;
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
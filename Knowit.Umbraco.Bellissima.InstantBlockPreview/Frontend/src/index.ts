import { LitElement, html, customElement, unsafeHTML} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";

@customElement('knowit-instant-block-preview')
export class InstantBlockPreview extends UmbElementMixin(LitElement) {

  
  #currentValue : any | undefined = undefined;
  #currentId : UmbWorkspaceUniqueType | undefined = undefined;
  #propertyType: string | undefined = undefined;
  #documentTypeId: string | undefined = undefined;
  #label: string | undefined = undefined;
  #loader = `<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...`;
  #showLoader = false;
  #htmlOutput = ``;

  constructor() {
    super();

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

        this.observe(observeMultiple(context.content, propertyContext.value), ([content, currentValue]) => {
          this.handleBlock(content, currentValue);
        });

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

    obj.contentData = [content];

    if(JSON.stringify(obj) === JSON.stringify(this.#currentValue)) {
      return;
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
      this.#htmlOutput = data.html;
      this.requestUpdate();
    });

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
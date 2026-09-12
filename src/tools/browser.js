export class BrowserTool {
  constructor({workspace=process.cwd(),headless=true}={}){this.workspace=workspace;this.headless=headless;this.browser=null;this.page=null}
  async open(url){const {chromium}=await import('playwright');this.browser??=await chromium.launch({headless:this.headless});this.page??=await this.browser.newPage({acceptDownloads:false});await this.page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});return {title:await this.page.title(),url:this.page.url()}}
  async screenshot(){if(!this.page)throw Error('browser is not open');return await this.page.screenshot({type:'png'})}
  async close(){await this.browser?.close();this.browser=null;this.page=null}
}

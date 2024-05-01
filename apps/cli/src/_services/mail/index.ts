export const getMailClient = (): MailClient => {
  return new MailClient({})
}

export class MailClient {
  // private readonly client: MandrillClient

  constructor (options: unknown) {
      // const { mandrillApiKey } = options
      // this.client = ...
      console.info('Setup')
  }

  /**
   * Send an email
   *
   * @param to {string} - receiver's email address
   * @param template {string} - name of template
   * @param content {Record<string,unknown>} - variables to insert into template
   */
  public async send (to: string, template: string, content: Record<string, unknown>): Promise<void> {

  }
}

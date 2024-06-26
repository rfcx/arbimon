import mailchimp, { type ApiClient, type MessagesMessage } from '@mailchimp/mailchimp_transactional'

import { requireEnv } from '~/env'
import { type MailTemplate, generateBody, generateSubject } from './templates'

const { MAILCHIMP_TRANSACTIONAL_API_KEY: apiKey } = requireEnv('MAILCHIMP_TRANSACTIONAL_API_KEY')

export const getMailClient = (): MailClient => {
  return new MailClient({ apiKey })
}

export class MailClient {
  private readonly client: ApiClient

  constructor (options: { apiKey: string }) {
    const { apiKey } = options
    this.client = mailchimp(apiKey)
  }

  /**
   * Send an email
   *
   * @param to {string} - receiver's email address
   * @param template {MailTemplate} - name of template
   * @param content {Record<string,unknown>} - variables to insert into template
   * @param bccEmail {string | undefined} email to send the blind carbon copy to
   */
  public async send (
    to: { email: string, name: string },
    template: MailTemplate,
    content: Record<string, unknown>,
    bccEmail?: string
  ): Promise<void> {
    const html = generateBody(template, content)
    const subject = generateSubject(template)
    const from = 'no-reply@arbimon.org'
    const message: MessagesMessage = {
      to: [to],
      from_email: from,
      subject,
      html,
      bcc_address: bccEmail
    }
    await this.client.messages.send({ message })
  }
}

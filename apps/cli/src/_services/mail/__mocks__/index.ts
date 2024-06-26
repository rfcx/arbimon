export const getMailClient = (): MailClient => {
  return new MailClient()
}

export class MailClient {
  public async send (
    _to: { email: string, name: string },
    _template: string,
    _content: Record<string, unknown>
  ): Promise<void> {}
}

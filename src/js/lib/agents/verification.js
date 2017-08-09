import * as settings from 'settings'
import * as request from 'superagent-es6-promise'

export default class VerificationAgent {
  constructor() {
    this.request = request
  }

  async startVerifyingEmail({wallet, email, id, pin}) {
    return await this._startVerifying({
      wallet, pin, dataType: 'email', id, data: email
    })
  }

  async startVerifyingPhone({wallet, phone, id, pin}) {
    return await this._startVerifying({
      wallet, pin, dataType: 'phone', id, data: phone
    })
  }

  async _startVerifying({wallet, data, id, dataType, pin}) {
    await Promise.all([
      this.request.post(wallet.identityURL + '/access/grant').send({
        identity: 'https://identity.jolocom.com/verification',
        pattern: `/identity/${dataType}/${id}`,
        read: true
      }),
      this.request.post(wallet.identityURL + '/access/grant').send({
        identity: 'https://identity.jolocom.com/verification',
        pattern: `/identity/${dataType}/${id}/verifications`,
        read: true,
        write: true
      })
    ])

    await this.request.post(
      `${settings.verificationProvider}/${dataType}/start-verification`
    ).send({
      identity: wallet.identityURL,
      id, [dataType]: data
    })
  }

  async verifyEmail({contractID, email, id, code}) {
    await this._verify({contractID, dataType: 'email', id, data: email, code})
  }

  async verifyPhone({contractID, phone, id, code}) {
    await this._verify({contractID, dataType: 'phone', id, data: phone, code})
  }

  async _verify({wallet, dataType, id, data, code}) {
    await this.request.post(
      `${settings.verificationProvider}/${dataType}/verify`
    ).send({
      identity: wallet.identityURL,
      id,
      [dataType]: data,
      code
    })
  }
}

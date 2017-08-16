import React from 'react'
import {connect} from 'redux/utils'
import Presentation from '../presentation/identity'
import WalletError from '../../common/error'

@connect({
  props: ['wallet.identity'],
  actions: [
    'confirmation-dialog:openConfirmDialog',
    'confirmation-dialog:closeConfirmDialog',
    'simple-dialog:showSimpleDialog',
    'simple-dialog:configSimpleDialog',
    'verification:confirmEmail',
    'verification:confirmPhone',
    'verification:startEmailVerification',
    'verification:startPhoneVerification',
    'wallet/identity:changePinValue',
    'wallet/identity:changeSmsCodeValue',
    'wallet/identity:getIdentityInformation',
    'wallet/identity:goTo',
    'wallet/identity:setFocusedPin',
    'wallet/identity:expandField',
    'wallet/identity:saveToBlockchain'
  ]
})

export default class WalletIdentityScreen extends React.Component {
  static propTypes = {
    changePinValue: React.PropTypes.func.isRequired,
    changeSmsCodeValue: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
    closeConfirmDialog: React.PropTypes.func.isRequired,
    configSimpleDialog: React.PropTypes.func.isRequired,
    confirmEmail: React.PropTypes.func.isRequired,
    confirmPhone: React.PropTypes.func.isRequired,
    expandField: React.PropTypes.func,
    getIdentityInformation: React.PropTypes.func.isRequired,
    goTo: React.PropTypes.func.isRequired,
    identity: React.PropTypes.object,
    openConfirmDialog: React.PropTypes.func.isRequired,
    resendVerificationLink: React.PropTypes.func,
    resendVerificationSms: React.PropTypes.func,
    saveToBlockchain: React.PropTypes.func.isRequired,
    setFocusedPin: React.PropTypes.func.isRequired,
    showSimpleDialog: React.PropTypes.func.isRequired,
    startEmailVerification: React.PropTypes.func.isRequired,
    startPhoneVerification: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.getIdentityInformation()
  }

  render() {
    const { identity } = this.props
    if (identity.error) {
      return (<WalletError
        message={'...oops something went wrong! We were not able to load ' +
        'your data.'}
        buttonLabel="RETRY"
        onClick={() => this.render()} />)
    }

    return (<Presentation
      identity={identity}
      expandField={this.props.expandField}
      setFocusedPin={this.props.setFocusedPin}
      changePinValue={this.props.changePinValue}
      goTo={this.props.goTo}
      showUserInfo={this.props.openConfirmDialog}
      requestIdCardVerification={
        ({title, message, rightButtonLabel, leftButtonLabel, index}) =>
          this.props.openConfirmDialog(title, message, rightButtonLabel,
          () => { this.props.saveToBlockchain(index) }, leftButtonLabel)
      }
      requestVerificationCode={(...args) => this.requestVerification(...args)}
      resendVerificationCode={(...args) => this.showVerificationWindow(...args,
        (...params) => this.resendVerificationCode(...params)
      )}
      enterVerificationCode={(...args) => this.showVerificationWindow(...args,
        (...params) => this.enterVerificationCode(...params)
      )} />)
  }

  showVerificationWindow({title, message, attrValue, attrType, index, rightButtonLabel, leftButtonLabel}, callback) { // eslint-disable-line max-len
    return this.props.openConfirmDialog(title, message, rightButtonLabel,
      callback({attrValue, attrType, index}), leftButtonLabel)
  }

  requestVerification(...args) {
    this.showVerificationWindow(args[0], () => {
      return () => this.showVerificationWindow(args[1], ({attrType, attrValue, index}) => { // eslint-disable-line max-len
        if (attrType === 'phone') {
          return () => this.props.startPhoneVerification({phone: attrValue, index}) // eslint-disable-line max-len
        } else if (attrType === 'email') {
          return () => this.props.startEmailVerification({email: attrValue, index}) // eslint-disable-line max-len
        }
      })
    })
  }

  resendVerificationCode({attrType, attrValue, index}) {
    if (attrType === 'phone') {
      return () => this.props.resendVerificationSms({phone: attrValue, index})
    } else if (attrType === 'email') {
      return () => this.props.resendVerificationLink({email: attrValue, index})
    }
  }

  enterVerificationCode({attrType, attrValue, index}) {
    if (attrType === 'phone') {
      return () => this.props.confirmPhone(index)
    } else if (attrType === 'email') {
      return () => this.props.confirmEmail({email: attrValue})
    }
  }
}

import Immutable from 'immutable'
import { makeActions } from '../'
import * as router from '../router'

const actions = module.exports = makeActions('wallet/money', {
  goToEtherManagement: {
    expectedParams: ['value'],
    creator: (params) => {
      return (dispatch) => {
        dispatch(router.pushRoute('/wallet/ether'))
        dispatch(actions.goToEtherManagement.buildAction(params))
      }
    }
  },
  getWalletAddressAndBalance: {
    expectedParams: [],
    async: true,
    creator: (params) => {
      return (dispatch, getState, {services, backend}) => {
        dispatch(actions.getWalletAddressAndBalance.buildAction(params, () => {
          return services.auth.currentUser.wallet.getWalletAddress()
          .then((result) => {
            dispatch(actions.setWalletAddress(result.walletAddress))
            return backend.gateway.getBalanceEther({
              userName: services.auth.currentUser.wallet.userName,
              walletAddress: result.walletAddress
            })
          })
          .then((result) => {
            return result
          })
        }))
      }
    }
  },
  setWalletAddress: {
    expectedParams: ['walletAddress']
  },
  buyEther: {
    expectedParams: ['stripeToken'],
    async: true,
    creator: (params) => {
      return (dispatch, getState, {services}) => {
        dispatch(actions.buyEther.buildAction(params, (backend) => {
          const {walletAddress} = getState().toJS().wallet.etherTabs.wallet
          return backend.gateway.buyEther({
            stripeToken: params.stripeToken,
            walletAddress: walletAddress
          }).then((response) => {
            dispatch(actions.getBalance())
            return response
          })
        }))
      }
    }
  },
  getBalance: {
    async: true,
    expectedParams: [],
    creator: (params) => {
      return (dispatch, getState, {services, backend}) => {
        dispatch(actions.getBalance.buildAction(params, (backend) => {
          const walletAddress = getState().toJS().wallet.money.walletAddress
          return backend.gateway.getBalanceEther({
            userName: services.auth.currentUser.wallet.userName,
            walletAddress: walletAddress
          })
        }))
      }
    }
  },
  getPrice: {
    async: true,
    expectedParams: [],
    creator: (params) => {
      return (dispatch, getState) => {
        dispatch(actions.getPrice.buildAction(params, (backend) => {
          return backend.gateway.retrieveEtherPrice()
        }))
      }
    }
  },
  goToWalletScreen: {
    expectedParams: [],
    creator: (params) => {
      return (dispatch) => {
        dispatch(router.pushRoute('/wallet/money'))
        dispatch(actions.goToWalletScreen.buildAction(params))
      }
    }
  },
  goToAccountDetailsEthereum: {
    expectedParams: [],
    creator: (params) => {
      return (dispatch) => {
        dispatch(router.pushRoute('/wallet/account-details'))
      }
    }
  }
})

const initialState = Immutable.fromJS({
  screenToDisplay: '',
  walletAddress: '',
  ether: {
    loaded: false,
    errorMsg: '',
    price: 0,
    amount: 0,
    checkingOut: false,
    buying: false
  }
})

module.exports.default = (state = initialState, action = {}) => {
  switch (action.type) {
    case actions.getWalletAddressAndBalance.id:
      return state.mergeIn(['ether'], {
        loaded: false,
        errorMsg: ''
      })

    case actions.getWalletAddressAndBalance.id_success:
      return state.mergeDeep({
        ether: {
          amount: parseFloat(action.result.ether),
          loaded: true,
          errorMsg: ''
        }
      })

    case actions.getWalletAddressAndBalance.id_fail:
      return state.mergeIn(['ether'], {
        errorMsg: 'Could not get your Wallet Address.',
        loaded: true
      })

    case actions.buyEther.id:
      return state.mergeIn(['ether'], {
        loaded: false,
        errorMsg: '',
        buying: true
      })

    case actions.buyEther.id_success:
      return state.mergeIn(['ether'], {
        loaded: true,
        errorMsg: '',
        buying: false,
        checkingOut: true
      })

    case actions.buyEther.id_fail:
      return state.mergeIn(['ether'], {
        loaded: true,
        errorMsg: 'Could not buy ether',
        buying: false
      })

    case actions.getBalance.id:
      return state.mergeIn(['ether'], {
        loaded: false,
        errorMsg: ''
      })

    case actions.getBalance.id_fail:
      return state.mergeIn(['ether'], {
        loaded: true,
        errorMsg: 'Could not get the user\'s ether balance'
      })

    case actions.getBalance.id_success:
      return state.mergeIn(['ether'], {
        amount: parseFloat(action.result.ether),
        loaded: true,
        errorMsg: ''
      })

    case actions.getPrice.id:
      return state.mergeIn(['ether'], {
        errorMsg: ''
      })

    case actions.getPrice.id_success:
      return state.mergeIn(['ether'], {
        price: action.result.ethForEur,
        errorMsg: ''
      })

    case actions.getPrice.id_fail:
      return state.mergeIn(['ether'], {
        errorMsg: 'Could not get the ether price'
      })

    case actions.goToEtherManagement.id:
      return state.merge({
        screenToDisplay: action.value
      })

    case actions.setWalletAddress.id:
      return state.mergeDeep({
        walletAddress: action.walletAddress
      })

    default:
      return state
  }
}

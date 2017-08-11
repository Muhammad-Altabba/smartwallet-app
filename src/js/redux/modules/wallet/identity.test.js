import {expect} from 'chai'
import * as identity from './identity'
// import * as router from '../router'
import {stub} from '../../../../../test/utils'
const reducer = require('./identity').default

describe('# Wallet identity redux module', () => {
  describe('# Reducer', () => {
    it('should initialise properly', () => {
      const state = reducer(undefined, '@@INIT')
      expect(state.toJS()).to.deep.equal({
        error: false,
        loaded: false,
        webId: '',
        expandedFields: {
          contact: false,
          idCards: false,
          passports: false
        },
        username: {verified: false, value: ''},
        contact: {
          phones: [{
            type: '', number: '', pin: '', verified: false, smsCode: '',
            pinFocused: false, codeIsSent: false
          }],
          emails: [{type: '', address: '', pin: '', verified: false}]
        },
        passports: [{
          number: '', givenName: '', familyName: '', birthDate: '',
          gender: '', showAddress: '', streetAndNumber: '', city: '',
          zip: '', state: '', country: '', verified: false
        }]
      })
    })

    it('should get the user\'s information on getIdentityInformation', () => {
      let state = reducer(undefined, '@@INIT')
      const action = {
        type: identity.actions.getIdentityInformation.id_success,
        result: {
          webId: 'https://test.webid.jolocom.com',
          userName: 'test',
          contact: {email: [{address: 'test'}], phone: [{number: 'test'}]},
          passports: ['test'],
          idCards: ['test']
        }
      }
      state = reducer(state, action)
      expect(state.toJS())
        .to.deep.equal({
          error: false,
          loaded: true,
          webId: 'https://test.webid.jolocom.com',
          expandedFields: {
            contact: false,
            idCards: false,
            passports: false
          },
          username: {value: 'test'},
          contact: {emails: [{address: 'test'}], phones: [{number: 'test'}]},
          passports: ['test'],
          idCards: ['test']
        })
    })
  })

  describe('# actions ', () => {
    it('goToDrivingLicenceManagement should redirect to drivering licence management', () => { // eslint-disable-line max-len
      const dispatch = stub()
      const action = identity.actions.goToDrivingLicenceManagement()
      action(dispatch)
      expect(dispatch.called).to.be.true
    })
    it('goToPassportManagement should redirect the user to passport management',
      () => {
        const dispatch = stub()
        const thunk = identity.actions.goToPassportManagement()
        thunk(dispatch)
        expect(dispatch.called).to.be.true
        expect(dispatch.calls).to.deep.equal([{
          args: [{
            payload: {
              args: ['/wallet/identity/passport/add'],
              method: 'push'
            },
            type: '@@router/CALL_HISTORY_METHOD'
          }]
        }])
      }
    )
    it('goToContactManagement should redirect the user to contact management',
      () => {
        const dispatch = stub()
        const thunk = identity.actions.goToContactManagement()
        thunk(dispatch)
        expect(dispatch.called).to.be.true
        expect(dispatch.calls).to.deep.equal([{
          args: [{
            payload: {
              args: ['/wallet/identity/contact'],
              method: 'push'
            },
            type: '@@router/CALL_HISTORY_METHOD'
          }]
        }])
      }
    )
    it('goToIdentity should redirect the user to the wallet Identity Tab',
      () => {
        const dispatch = stub()
        const thunk = identity.actions.goToIdentity()
        thunk(dispatch)
        expect(dispatch.called).to.be.true
        expect(dispatch.calls).to.deep.equal([{
          args: [{
            payload: {
              args: ['/wallet/identity/'],
              method: 'push'
            },
            type: '@@router/CALL_HISTORY_METHOD'
          }]
        }])
      }
    )
    it('getIdentityInformation should retrieve identity information', () => {
      const getState = stub()
      const services = {auth: {
        currentUser: {
          wallet: {
            getUserInformation: stub().returns('information')
          }
        }
      }}
      const dispatch = stub()
      const thunk = identity.actions.getIdentityInformation()
      thunk(dispatch, getState, {services})

      expect(dispatch.called).to.be.true
    })
  })
})

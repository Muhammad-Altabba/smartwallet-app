import { ThunkAction } from '../store'
//import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { navigationActions, genericActions } from './index'
import { routeList } from '../routeList'
import settingKeys from '../ui/settings/settingKeys'
import { removeNotification } from './notifications'
import { entropyToMnemonic, mnemonicToEntropy } from 'bip39'
import useResetKeychainValues from 'src/ui/deviceauth/hooks/useResetKeychainValues'
import { PIN_SERVICE } from 'src/ui/deviceauth/utils/keychainConsts'
 // TODO Import ^ from jolocom-lib

export const showSeedPhrase = (): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  const encryptedSeed = await agent.storage
    .get.setting('encryptedSeed')

  if (!encryptedSeed) {
    throw new Error('Can not retrieve Seed from database')
  }

  const decrypted = await agent.idw.asymDecrypt(
    Buffer.from(encryptedSeed.b64Encoded, 'base64'),
    await agent.passwordStore.getPassword()
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.SeedPhrase,
      params: { mnemonic: entropyToMnemonic(decrypted)},
    }),
  )
}

/**
 * called during PIN code restoration
 */
export const onRestoreAccess = (mnemonicInput: string[]): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  let recovered = false

  const recoveredEntropy = Buffer.from(
    mnemonicToEntropy(mnemonicInput.join(' ')),
    'hex'
  )

  try {
    if (agent.didMethod.recoverFromSeed) {
      const { identityWallet } = await agent.didMethod.recoverFromSeed(
        recoveredEntropy,
        await agent.passwordStore.getPassword()
      )
      recovered = identityWallet.did === agent.idw.did
    }
  } catch(e) {
    console.error('onRestoreAccess failed', e)
  }

  if (recovered) {
    const resetServiceValuesInKeychain = useResetKeychainValues(PIN_SERVICE)
    await resetServiceValuesInKeychain()
    dispatch(navigationActions.navigatorResetHome())
  }

  // we re-lock the app, which will trigger the create pin screen
  return dispatch(genericActions.lockApp())
}

export const setSeedPhraseSaved = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  // No delete call available yet, overwriting with empty object
  await backendMiddleware.storage.store.setting('encryptedSeed', {})
  await backendMiddleware.storage.store.setting(
    settingKeys.seedPhraseSaved,
    true,
  )

  // TODO: find sticky by id from queue, not active
  const {
    notifications: { active: stickyNotification },
  } = getState()
  if (stickyNotification) dispatch(removeNotification(stickyNotification))

  return dispatch({
    type: 'SET_SEED_PHRASE_SAVED',
  })
}

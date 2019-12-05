import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

const SvgIdentity = props => (
  <Svg width={17} height={21} {...props}>
    <G fill={props.tintColor} fillRule="nonzero">
      <Path d="M16.044 2.116l-6.779-2a2.838 2.838 0 0 0-1.61 0l-6.778 2c-.5.147-.85.615-.85 1.136v5.614c0 2.598.774 5.1 2.237 7.235a12.803 12.803 0 0 0 5.748 4.637 1.188 1.188 0 0 0 .897 0 12.803 12.803 0 0 0 5.748-4.637 12.743 12.743 0 0 0 2.237-7.235V3.252c0-.521-.35-.989-.85-1.136zm-.098 6.75c0 2.406-.716 4.722-2.07 6.699a11.857 11.857 0 0 1-5.325 4.294.24.24 0 0 1-.181 0c-2.16-.879-4.001-2.364-5.324-4.294a11.798 11.798 0 0 1-2.07-6.699V3.252c0-.104.07-.197.17-.227l6.778-2a1.894 1.894 0 0 1 1.073 0l6.779 2c.1.03.17.123.17.227v5.614z" />
      <Path d="M13.276 8.866a9.132 9.132 0 0 1-1.664 5.277 9.261 9.261 0 0 1-3.151 2.811 9.261 9.261 0 0 1-3.152-2.811 9.132 9.132 0 0 1-1.664-5.277V5.071l4.816-1.42 4.815 1.42v3.795z" />
    </G>
  </Svg>
)

export default SvgIdentity

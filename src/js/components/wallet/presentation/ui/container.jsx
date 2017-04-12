import React from 'react'
import Radium from 'radium'

import {theme} from 'styles'

const STYLE = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
  textAlign: 'left',
  padding: '16px',
  backgroundColor: theme.jolocom.gray4,
  boxSizing: 'border-box',
  overflowY: 'auto',
  minHeight: '100%'
}

const Container = ({style, children, ...props} = {}) => {
  return (
    <div style={Object.assign({}, STYLE, style)} {...props}>
      {children}
    </div>
  )
}

Container.propTypes = {
  children: React.PropTypes.node,
  style: React.PropTypes.object
}

export default Radium(Container)

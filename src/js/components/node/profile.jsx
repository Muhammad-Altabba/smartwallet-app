import React from 'react'
import Reflux from 'reflux'
import Radium from 'radium'
import d3 from 'd3'

import {
  AppBar,
  IconButton,
  FloatingActionButton,
  FontIcon,
  List, ListItem, Divider
} from 'material-ui'

import PinnedActions from 'actions/pinned'
import PinnedStore from 'stores/pinned'

let ProfileNode = React.createClass({

  mixins: [
    Reflux.listenTo(PinnedStore, 'onUpdatePinned')
  ],

  contextTypes: {
    history: React.PropTypes.any,
    profile: React.PropTypes.object,
    muiTheme: React.PropTypes.object
  },

  componentWillMount() {
    this.onUpdatePinned()
  },

  onUpdatePinned() {
    this.setState({pinned: PinnedStore.isPinned(this.props.node.uri)})
  },

  getStyles() {
    let {muiTheme} = this.context
    let {img} = this.props.node
    let background

    if (img) {
      background = img
    }

    return {
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      },
      header: {
        color: '#fff',
        height: '176px',
        background: `${muiTheme.jolocom.gray1} url(${background}) center / cover`
      },
      title: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: '0 24px'
      },
      action: {
        position: 'absolute',
        bottom: '-20px',
        right: '20px',
        backgroundColor: this.state.pinned ? muiTheme.palette.accent1Color :
          muiTheme.jolocom.gray4
      }
    }
  },

  render() {
    let styles = this.getStyles()
    this.full = false
    let {name, title, description, email} = this.props.node

    return (
      <div style={styles.container}>
        <AppBar
          id = 'AppBar'
          style={styles.header}
          titleStyle={styles.title}
          title={<span>{name || title || 'No name set'}</span>}
          iconElementLeft={<IconButton iconClassName="material-icons" onClick={this._handleClose}>close</IconButton>}
          iconElementRight={<IconButton iconClassName="material-icons" onClick={this._handleFull}>crop_original</IconButton>}
        >

        </AppBar>

        <List style={styles.list}>
          {description && (
            <div>
              <ListItem
                leftIcon={<FontIcon className="material-icons">info</FontIcon>}
                primaryText={description}
              />
              <Divider inset={true} />
            </div>
          )}
          {email && (
            <ListItem
              leftIcon={<FontIcon className="material-icons">email</FontIcon>}
              primaryText={email}
              secondaryText="Personal"
            />
          )}
        </List>

      </div>
    )
  },

  _handleClose() {
    this.props.onClose()
  },

  _handleFull() {

    if (this.full){
      d3.select('#AppBar').style('height', '176px')
      d3.select('#AppBar').style('height', '176px')
      this.full = false
    }
    else {
      d3.select('#AppBar').style('height', '90vh')
      this.full = true
    }

  },

  _handleBookmarkClick() {
    PinnedActions.pin(this.props.node.uri)
  }
})

export default Radium(ProfileNode)
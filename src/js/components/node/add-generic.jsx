import React from 'react'
import Radium from 'radium'
import Reflux from 'reflux'

import {
  AppBar,
  IconButton,
  Card,
  CardMedia,
  FlatButton,
  TextField,
  List,
  ListItem,
  SelectField, MenuItem, Chip
} from 'material-ui'

import AddNodeIcon from 'components/icons/addNode-icon.jsx'

import Dialog from 'components/common/dialog.jsx'
import {Layout, Content} from 'components/layout'
import nodeStore from 'stores/node'
import Util from 'lib/util'
import previewStore from 'stores/preview-store'
import graphActions from 'actions/graph-actions'
import {PRED} from 'lib/namespaces'
import GraphAgent from 'lib/agents/graph.js'
import GraphPreview from './graph-preview.jsx'

import ActionDescription from 'material-ui/svg-icons/action/description'
import SocialShare from 'material-ui/svg-icons/social/share'
import ActionLabel from 'material-ui/svg-icons/action/label'

// import NodeAddDefault from './add-default.jsx'
// import NodeAddLink from './add-link.jsx'
// import NodeAddImage from './add-image.jsx'

// let types = {
//   default: {
//     component: NodeAddDefault
//   },
//   link: {
//     component: NodeAddLink
//   },
//   image: {
//     title: 'Upload image',
//     component: NodeAddImage
//   }
// }

let NodeAddGeneric = React.createClass({
  mixins: [
    Reflux.connect(nodeStore, 'node'),
    Reflux.connect(previewStore, 'graphState')
  ],

  propTypes: {
    params: React.PropTypes.object
  },

  contextTypes: {
    router: React.PropTypes.any,
    node: React.PropTypes.any,
    muiTheme: React.PropTypes.object,
    user: React.PropTypes.object
  },

  getInitialState() {
    return {
      type: 'default',
      privacy: 'Private',
      tagArray: [
        {
          key: 1,
          label: 'image'
        }
      ]
    }
  },

  componentDidMount() {
    this.refs.dialog.show()
    this.gAgent = new GraphAgent()
    this.listenTo(previewStore, this.getUser)
  },

  getUser(state) {
    // We need to know the uri of the currently centered node, this way we
    // deduce the Access Controll. Taking it from the graph preview.
    if (state.center) this.user = state.center.uri
  },

  close() {
    this.refs.dialog.hide()
    this.context.router.goBack()
  },

  validates() {
    let {title} = this.state
    return title && title.trim()
  },

  submit() {
    if (!this.validates()) return false
    let {title, description, image} = this.state
    if (this.state.graphState.user && this.state.graphState.center) {
      let currentUser = this.state.graphState.user
      let centerNode = this.state.graphState.center
      // let isConfidential = (this.state.type == 'confidential')
      // if (isConfidential) this.state.type = 'default'

      // @TODO Previously called nodeActions.create;
      // except it cannot have a return value
      this.gAgent.createNode(currentUser, centerNode, title, description, image,
        this.state.type, false).then((uri) => {
          graphActions.drawNewNode(uri, PRED.isRelatedTo.uri)
        })
    } else {
      // console.log('Did not work,logged in user or center node not detected
      // correctly.')
    }
  },

  getStyles() {
    const {muiTheme} = this.context
    return {
      bar: {
        backgroundColor: muiTheme.actionAppBar.color,
        color: muiTheme.actionAppBar.textColor
      },
      title: {
        color: muiTheme.actionAppBar.textColor
      },
      icon: {
        color: muiTheme.actionAppBar.textColor
      },
      image: {
        height: '176px',
        backgroundColor: '#9ca0aa'
      },
      headerIcon: {
        position: 'absolute',
        zIndex: 1500,
        width: '200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        left: '0',
        right: '0',
        marginTop: '50px'
      },
      nodeTitle: {
        padding: '10px 24px',
        color: '#4b132b',
        fontWeight: '100',
        fontSize: '1.5em'
      },
      accordionChildren: {
        backgroundColor: muiTheme.jolocom.gray5
      },
      labelStyle: {
        top: '30px'
      },
      inputStyle: {
        marginTop: '-20px', height: '50px'
      },
      underlineStyle: {
        display: 'none'
      },
      chipWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: '-10px'
      },
      chip: {
        margin: '4px'
      }
    }
  },

  // getTypeConfig(type) {
  //   return types[type] || types.default
  // },

  render: function() {
    let styles = this.getStyles()
    let title = 'Edit node'
    // let {type} = this.props.params
    // let config = this.getTypeConfig(type)
    // let title = config.title || `New ${type}`

    return (
      <Dialog ref="dialog" fullscreen>
        <Layout>
          <div style={styles.headerIcon}>
            <AddNodeIcon />
          </div>
          <div style={{display: 'none'}}>
            <GraphPreview />
          </div>
          <AppBar
            title={title}
            titleStyle={styles.title}
            iconElementLeft={
              <IconButton
                iconStyle={styles.icon}
                iconClassName="material-icons"
                onTouchTap={this._handleClose}>close
              </IconButton>
            }
            iconElementRight={
              <FlatButton
                style={styles.icon}
                label="Create"
                onTouchTap={this._handleSubmit}
              />
            }
            style={styles.bar}
          />
          <Content style={styles.content}>
            <Card>
              <CardMedia
                style={styles.image} />
            </Card>
            <TextField
              name="givenName"
              style={styles.nodeTitle}
              placeholder="Add node title"
              onChange={Util.linkToState(this, 'title')} />
            <List>
              <ListItem
                primaryText="General"
                primaryTogglesNestedList
                nestedListStyle={styles.accordionChildren}
                open
                nestedItems={[
                  <ListItem
                    key={1}
                    leftIcon={<SocialShare color="#9ba0aa" />}>
                    <SelectField
                      style={{marginTop: '-10px'}}
                      value={this.state.privacy}
                      onChange={this._handleTogglePrivacy}>
                      <MenuItem value={'Private'} primaryText="Private" />
                      <MenuItem value={'Public'} primaryText="Public" />
                    </SelectField>
                  </ListItem>,
                  <ListItem
                    key={2}
                    leftIcon={<ActionDescription color="#9ba0aa" />}>
                    <TextField
                      style={styles.inputStyle}
                      floatingLabelStyle={styles.labelStyle}
                      underlineStyle={styles.underlineStyle}
                      placeholder="Description"
                      onChange={Util.linkToState(this, 'description')} />
                  </ListItem>,
                  <ListItem
                    key={3}
                    leftIcon={<ActionLabel color="#9ba0aa" />}>
                    <div style={styles.chipWrapper}>
                      {this.state.tagArray.map(this.renderChip, this)}
                    </div>
                  </ListItem>
                ]} />
            </List>
          </Content>
        </Layout>
      </Dialog>
    )
  },

  renderChip(data) {
    let styles = this.getStyles()
    return (
      <Chip
        key={data.key}
        style={styles.chip}
        onRequestDelete={this._handleChipDelete}>
        {data.label}
      </Chip>
    )
  },

  _handleChipDelete() {
    console.log('delete chip')
  },

  _handleTogglePrivacy(event, index, value) {
    this.setState({
      privacy: value
    })
  },

  _handleSubmit() {
    this.submit()
    this.close()
  },

  _handleSuccess() {
    this.close()
  },

  _handleClose() {
    this.refs.dialog.hide()
    this.context.router.goBack()
  }
})

export default Radium(NodeAddGeneric)

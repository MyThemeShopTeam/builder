import React from 'react'

import Logo from '../../../../resources/components/navbar/logo/logo'
import PlusControl from '../../../../resources/components/navbar/controls/plusControl'
import PlusTeaserControl from '../../../../resources/components/navbar/controls/plusTeaserControl'
import AddTemplateControl from '../../../../resources/components/navbar/controls/addTemplateControl'
import TreeViewControl from '../../../../resources/components/navbar/controls/treeViewControl'
import UndoRedoControl from '../../../../resources/components/navbar/controls/undoRedoControl'
import LayoutControl from '../../../../resources/components/navbar/controls/layout/layoutControl'
import SettingsButtonControl from '../../../../resources/components/navbar/controls/settingsButtonControl'
import WordPressHeaderControl from '../../../../resources/components/navbar/controls/wordpressHeaderControl'
import WordPressPostSaveControl from '../../../../resources/components/navbar/controls/wordpressPostSaveControl'
import NavbarSeparator from '../../../../resources/components/navbar/controls/navbarSeparator'
import Navbar from '../../../../resources/components/navbar/navbar'
import NavbarWrapper from '../../../../resources/components/navbar/navbarWrapper'
import GoPremiumControl from '../../../../resources/components/navbar/controls/goPremiumControl'
import {getStorage, env} from 'vc-cake'

const workspaceStorage = getStorage('workspace')
const contentEndState = workspaceStorage.state('contentEnd')

export default class NavbarContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      locked: false
    }
    this.updateLockedState = this.updateLockedState.bind(this)
  }

  componentDidMount () {
    contentEndState.onChange(this.updateLockedState)
  }

  componentWillUnmount () {
    contentEndState.ignoreChange(this.updateLockedState)
  }

  updateLockedState (data) {
    this.setState({ locked: !!data })
  }

  render () {
    const { locked } = this.state
    if (env('HUB_REDESIGN')) {
      return <NavbarWrapper wrapperRef={this.props.wrapperRef}>
        <Navbar locked={locked} draggable getNavbarPosition={this.props.getNavbarPosition}>
          <GoPremiumControl visibility='hidden' />
          <Logo visibility='pinned' editor='frontend' />
          <PlusControl visibility='pinned' />
          <AddTemplateControl />
          <TreeViewControl visibility='pinned' />
          <UndoRedoControl />
          <LayoutControl visibility='pinned' />
          <SettingsButtonControl />
          {env('HUB_TEASER') ? <PlusTeaserControl /> : null}
          <NavbarSeparator visibility='pinned' />
          <WordPressPostSaveControl visibility='pinned' />
          <WordPressHeaderControl visibility='hidden' />
        </Navbar>
      </NavbarWrapper>
    }

    return <NavbarWrapper>
      <Navbar locked={locked} draggable>
        <GoPremiumControl visibility='hidden' />
        <Logo visibility='pinned' editor='frontend' />
        <PlusControl visibility='pinned' />
        <AddTemplateControl />
        <TreeViewControl visibility='pinned' />
        <UndoRedoControl />
        <LayoutControl visibility='pinned' />
        <SettingsButtonControl />
        {env('HUB_TEASER') ? <PlusTeaserControl /> : null}
        <NavbarSeparator visibility='pinned' />
        <WordPressPostSaveControl visibility='pinned' />
        <WordPressHeaderControl visibility='hidden' />
      </Navbar>
    </NavbarWrapper>
  }
}
import React from 'react'
import classNames from 'classnames'
import { getService, getStorage, env } from 'vc-cake'
import PropTypes from 'prop-types'

const hubCategories = getService('hubCategories')
const workspaceStorage = getStorage('workspace')
const elementsStorage = getStorage('elements')
const workspaceSettings = workspaceStorage.state('settings')
const documentManager = getService('document')

export default class EditFormHeader extends React.Component {
  static propTypes = {
    elementAccessPoint: PropTypes.object.isRequired,
    options: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      content: props.elementAccessPoint.cook().getName(),
      editable: false,
      hidden: props.elementAccessPoint.cook().get('hidden')
    }

    this.handleClickEnableEditable = this.handleClickEnableEditable.bind(this)
    this.handleBlurValidateContent = this.handleBlurValidateContent.bind(this)
    this.editTitle = this.editTitle.bind(this)
    this.handleKeyDownPreventNewLine = this.handleKeyDownPreventNewLine.bind(this)
    this.updateElementOnChange = this.updateElementOnChange.bind(this)
    this.handleClickGoBack = this.handleClickGoBack.bind(this)
    this.handleClickHide = this.handleClickHide.bind(this)
    this.updateHiddenState = this.updateHiddenState.bind(this)
  }

  componentDidMount () {
    const { elementAccessPoint } = this.props
    elementAccessPoint.onChange(this.updateElementOnChange)
    workspaceStorage.on('hide', this.updateHiddenState)
  }

  componentWillUnmount () {
    const { elementAccessPoint } = this.props
    elementAccessPoint.ignoreChange(this.updateElementOnChange)
    workspaceStorage.off('hide', this.updateHiddenState)
  }

  updateHiddenState (id) {
    const { elementAccessPoint } = this.props
    if (id === elementAccessPoint.id) {
      const newHiddenState = documentManager.get(elementAccessPoint.id).hidden
      this.setState({ hidden: newHiddenState })
    }
  }

  updateElementOnChange () {
    const { elementAccessPoint } = this.props
    const cookElement = elementAccessPoint.cook()
    const content = cookElement.getName()
    // Check element name field
    if (this.state.content !== content) {
      this.setState({
        content
      }, () => {
        this.span.innerText = content
      })
    }

    // Trigger attributes events
    const publicKeys = cookElement.filter((key, value, settings) => {
      return settings.access === 'public'
    })
    publicKeys.forEach((key) => {
      const newValue = cookElement.get(key)
      elementsStorage.trigger(`element:${cookElement.get('id')}:attribute:${key}`, newValue, cookElement)
    })
  }

  handleClickEnableEditable () {
    this.setState({
      editable: true
    }, () => {
      this.span.focus()
    })
  }

  editTitle () {
    this.handleClickEnableEditable()
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(this.span)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  updateContent (value) {
    const { elementAccessPoint } = this.props
    if (!value) {
      this.span.innerText = elementAccessPoint.cook().getName()
    }
    elementAccessPoint.set('customHeaderTitle', value)
    this.setState({
      editable: false
    })
  }

  handleBlurValidateContent () {
    const value = this.span.innerText.trim()
    this.updateContent(value)
  }

  handleKeyDownPreventNewLine (event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.nativeEvent.stopImmediatePropagation()
      event.stopPropagation()
      this.span.blur()
      this.handleBlurValidateContent()
    }
  }

  handleClickGoBack () {
    let { parentElementAccessPoint: accessPoint, options } = this.props.options
    // If multiple nesting used we can goBack only to ROOT
    if (this.props.isEditFormSettingsOpened) {
      this.props.handleEditFormSettingsToggle()
    } else {
      while (accessPoint.inner) {
        if (accessPoint.parentElementAccessPoint) {
          accessPoint = accessPoint.parentElementAccessPoint
        } else {
          break
        }
      }
      workspaceStorage.trigger('edit', accessPoint.id, accessPoint.tag, options)
    }
  }

  handleClickCloseContent (e) {
    e && e.preventDefault()
    workspaceSettings.set(false)
  }

  handleClickHide () {
    workspaceStorage.trigger('hide', this.props.elementAccessPoint.id)
  }

  render () {
    const { elementAccessPoint, options, isEditFormSettingsOpened } = this.props
    let { content, editable, hidden } = this.state
    const isNested = options && (options.child || options.nestedAttr)
    const headerTitleClasses = classNames({
      'vcv-ui-edit-form-header-title': true,
      active: editable
    })
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const closeTitle = localizations ? localizations.close : 'Close'
    const backToParentTitle = localizations ? localizations.backToParent : 'Back to parent'
    let backButton = null
    if (isNested || isEditFormSettingsOpened) {
      backButton = (
        <span className='vcv-ui-edit-form-back-button' onClick={this.handleClickGoBack} title={backToParentTitle}>
          <i className='vcv-ui-icon vcv-ui-icon-chevron-left' />
        </span>
      )
    }

    if (isNested && options.activeParamGroupTitle) {
      content = options.activeParamGroupTitle
    }

    const sectionImageSrc = hubCategories.getElementIcon(elementAccessPoint.tag)
    let sectionImage = null
    if (sectionImageSrc) {
      sectionImage = <img className='vcv-ui-edit-form-header-image' src={sectionImageSrc} title={content} />
    }

    let headerTitle
    if (isNested && options.activeParamGroup) {
      headerTitle = <span className={headerTitleClasses} ref={span => { this.span = span }}>{content}</span>
    } else {
      headerTitle = (
        <span
          className={headerTitleClasses}
          ref={span => { this.span = span }}
          contentEditable={editable}
          suppressContentEditableWarning
          onClick={this.handleClickEnableEditable}
          onKeyDown={this.handleKeyDownPreventNewLine}
          onBlur={this.handleBlurValidateContent}
        >
          {content}
        </span>
      )
    }

    let hideControl = null
    if (elementAccessPoint.tag !== 'column') {
      const iconClasses = classNames({
        'vcv-ui-icon': true,
        'vcv-ui-icon-eye-on': !hidden,
        'vcv-ui-icon-eye-off': hidden
      })
      let visibilityText = ''
      if (hidden) {
        visibilityText = localizations ? localizations.hideOn : 'Hide: On'
      } else {
        visibilityText = localizations ? localizations.hideOff : 'Hide: Off'
      }
      hideControl = (
        <span
          className='vcv-ui-edit-form-header-control'
          title={visibilityText}
          onClick={this.handleClickHide}
        >
          <i className={iconClasses} />
        </span>
      )
    }

    const editFormSettingsIconClasses = classNames({
      'vcv-ui-icon': true,
      'vcv-ui-icon-cog': true
    })

    let settingsControl = null
    const cookElement = elementAccessPoint.cook()
    const isGeneral = cookElement.relatedTo('General') || cookElement.relatedTo('RootElements')

    if (env('VCV_ADDON_ELEMENT_PRESETS_ENABLED') && isGeneral) {
      const editFormSettingsText = localizations ? localizations.editFormSettingsText : 'Element Settings'
      settingsControl = (
        <span
          className='vcv-ui-edit-form-header-control'
          title={editFormSettingsText}
          onClick={this.props.handleEditFormSettingsToggle}
        >
          <i className={editFormSettingsIconClasses} />
        </span>
      )
    }

    return (
      <div className='vcv-ui-edit-form-header'>
        {backButton}
        {sectionImage}
        {headerTitle}
        <span className='vcv-ui-edit-form-header-control-container'>
          {isNested ? null : hideControl}
          {isNested ? null : settingsControl}
          <span
            className='vcv-ui-edit-form-header-control'
            title={closeTitle}
            onClick={this.handleClickCloseContent}
          >
            <i className='vcv-ui-icon vcv-ui-icon-close-thin' />
          </span>
        </span>
      </div>
    )
  }
}

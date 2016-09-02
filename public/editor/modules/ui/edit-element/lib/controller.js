import React from 'react'
import FormWrapper from './form-wrapper'
import ActivitiesManager from './activities-manager'

export default class EditElementController extends ActivitiesManager {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    element: React.PropTypes.object.isRequired
  }

  render () {
    return (
      <FormWrapper
        {...this.props}
        setFieldMount={this.setFieldMount}
        setFieldUnmount={this.setFieldUnmount}
        callFieldActivities={this.callFieldActivities}
      />
    )
  }
}

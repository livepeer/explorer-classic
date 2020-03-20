import * as React from 'react'
import styled from 'styled-components'

const InlineHint = styled(
  class InlineHint extends React.Component {
    static defaultProps = {
      flag: 'help_default',
      disableHide: false,
    }
    state = {
      hidden: this.props.disableHide
        ? false
        : !!localStorage.getItem(`help_${this.props.flag}`),
    }
    onHide = () => {
      if (this.props.disableHide) return
      localStorage.setItem(`help_${this.props.flag}`, 'true')
      this.setState({ hidden: true })
    }
    render() {
      const { className, children, disableHide } = this.props
      const { hidden } = this.state
      return (
        <div className={`${className}${hidden ? ' hidden' : ''}`}>
          {!disableHide && (
            <div className="hide-section">
              <button className="hide" onClick={this.onHide}>
                &times;
              </button>
            </div>
          )}
          {children}
        </div>
      )
    }
  },
)`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  padding: 32px;
  background: #d9f2e8;
  border: 1px solid #b3e6cf;
  margin-bottom: 24px;
  transition: all 0.3s linear;
  &.hidden {
    transform: rotateX(-90deg);
    height: 0;
    opacity: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  .hide-section {
    position: absolute;
    width: auto;
    top: 0;
    right: 0;
    .hide {
      color: var(--bg-dark);
      background: none;
      margin: 0;
      font-size: 32px;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      outline: none;
      line-height: 1;
      opacity: 0.25;
      box-shadow: none;
    }
  }
  > * {
    width: 100%;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 8px 0;
    font-weight: normal;
  }
  p {
    margin: 0;
    line-height: 1.5;
  }
`

export default InlineHint

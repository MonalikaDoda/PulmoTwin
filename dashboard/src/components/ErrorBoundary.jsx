import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            padding: '24px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '12px',
            margin: '16px 0',
            color: '#9f1239'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <AlertCircle size={20} color="#e11d48" />
            <strong style={{ fontSize: 14 }}>
              {this.props.title || 'Component Display Error'}
            </strong>
          </div>
          <p style={{ fontSize: 12.5, color: '#be123c', margin: '0 0 12px 0', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred. Safe defaults have been preserved.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} /> Retry Component
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

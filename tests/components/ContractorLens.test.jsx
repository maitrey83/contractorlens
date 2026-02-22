import { render } from '@testing-library/react'
import { describe, it } from 'vitest'
import ContractorLens from '../../src/ContractorLens.jsx'

describe('ContractorLens', () => {
  it('renders without crashing', () => {
    render(<ContractorLens />)
  })
})

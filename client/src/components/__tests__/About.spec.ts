import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import About from '../About.vue'

describe('About', () => {
  it('renders properly', () => {
    const wrapper = mount(About, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})

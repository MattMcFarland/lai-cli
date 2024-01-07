import {expect, test} from '@oclif/test'
import sinon from 'sinon'
import dotenv from 'dotenv'

// Hook tests typically check whether the expected side effects of the hook occur.
describe('init hook', () => {
  // You can use sinon to spy on dotenv to confirm it gets called.
  const configSpy = sinon.spy(dotenv, 'config')

  // Before each test case, reset the spy state to avoid false results.
  beforeEach(() => {
    configSpy.resetHistory()
  })

  // Your tests for the init hook will likely be integrated into other command tests.
  // Here, as an example, let's assume there's a 'dummy' command you want to execute.
  test
    .stdout()
    .command(['help'])
    .it('loads environment variables', (ctx) => {
      expect(configSpy.calledOnce).to.be.true
    })

  // After all tests, restore the original function to avoid affecting other tests.
  after(() => {
    configSpy.restore()
  })
})

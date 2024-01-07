import {expect, test} from '@oclif/test'

const apiSuccess = (api: any) =>
  api
    .persist()
    .post('/models/apply')
    .reply(200, {uuid: '1234-1234-1234-1234-1234'})

    .get('/models/jobs/1234-1234-1234-1234-1234')
    .reply(200, {
      processed: true,
      progress: 100,
      downloaded_size: '10MB',
      file_size: '10MB',
      message: 'completed',
    })

describe('add', () => {
  test
    .nock('http://127.0.0.1:8080', apiSuccess)
    .stdout()
    .command(['add', 'model-gallery@bert-embeddings', '--name', 'bert-embeddings'])
    .it('installs a model using a gallery ID', (ctx) => {
      expect(ctx.stdout).to.contain('Installation completed.')
    })

  test
    .nock('http://127.0.0.1:8080', apiSuccess)
    .stdout()
    .command(['add', 'https://github.com/example/model-definition.yaml', '--name', 'model'])
    .it('installs a model using a URL', (ctx) => {
      expect(ctx.stdout).to.contain('Installation completed.')
    })

  test
    .nock('http://127.0.0.1:8080', apiSuccess)
    .stdout()
    .command(['add', 'github:example/repository/model-definition.yaml', '--name', 'gh-model'])
    .it('installs a model using a GitHub URL shorthand', (ctx) => {
      expect(ctx.stdout).to.contain('Installation completed.')
    })

  test
    .nock('http://127.0.0.1:8080', apiSuccess)
    .stdout()
    .command(['add', 'model-gallery@example-model'])
    .it('installs a model using a model gallery ID without a name', (ctx) => {
      expect(ctx.stdout).to.contain('Installation completed.')
    })

  test
    .nock('http://127.0.0.1:8080', apiSuccess)
    .stdout()
    .command(['add', '/path/to/model-definition.yaml'])
    .it('installs a model when path looks relative', (ctx) => {
      expect(ctx.stdout).to.contain('Installation completed.')
    })

  test
    .stdout()
    .command(['add', 'model-gallery'])
    .catch((error) => {
      expect(error.message).to.contain('Invalid model-gallery ID format')
      expect(error).to.be.an.instanceOf(Error)
    })
    .it('throws an error when when using invalid model gallery ID')

  test
    .stdout()
    .command(['add', 'https:////-$%&^%$#@!'])
    .catch((error) => {
      expect(error.message).to.contain('Invalid URL format')
      expect(error).to.be.an.instanceOf(Error)
    })
    .it('throws an error when using invalid URL')

  test
    .stdout()
    .command(['add', '', '--name', 'just-a-name'])
    .catch((error) => {
      expect(error).to.be.an.instanceOf(Error)
    })
    .it('throws an error when trying to install a model without a URL or gallery ID')
})

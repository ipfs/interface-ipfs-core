/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')

const testFile = loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
const testHash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

module.exports = (common) => {
  describe.only('.pin', function () {
    this.timeout(50 * 1000)

    let ipfs
    let withJs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node

          node.id((err, id) => {
            expect(err).to.not.exist()
            withJs = id.agentVersion.startsWith('js-ipfs')
            populate()
          })
        })
      })

      function populate () {
        ipfs.files.add(testFile, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.have.length(1)
          expect(res[0].hash).to.equal(testHash)
          expect(res[0].path).to.equal(testHash)
          done()
        })
      }
    })

    after((done) => common.teardown(done))

    describe('callback API', () => {
      // 1st, because ipfs.files.add pins automatically
      it('.ls type recursive', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'recursive'
          })
          done()
        })
      })

      it.skip('.ls type indirect', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.ls({ type: 'indirect' }, (err, pinset) => {
          expect(err).to.not.exist()
          // because the pinned file has no links
          expect(pinset).to.be.empty()
          done()
        })
      })

      it('.rm', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.rm(testHash, { recursive: true }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash
          }])
          ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
            expect(err).to.not.exist()
            expect(pinset).to.not.deep.include({
              hash: testHash,
              type: 'recursive'
            })
            done()
          })
        })
      })

      it('.add', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.add(testHash, { recursive: false }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash
          }])
          done()
        })
      })

      it('.ls', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.ls((err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'direct'
          })
          done()
        })
      })

      it('.ls type direct', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'direct'
          })
          done()
        })
      })

      it('.ls for a specific hash', function (done) {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        ipfs.pin.ls(testHash, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash,
            type: 'direct'
          }])
          done()
        })
      })
    })

    describe('promise API', () => {
      it('.add', function () {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        return ipfs.pin.add(testHash, { recursive: false })
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash
            }])
          })
      })

      it('.ls', function () {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        return ipfs.pin.ls()
          .then((pinset) => {
            expect(pinset).to.deep.include({
              hash: testHash,
              type: 'direct'
            })
          })
      })

      it('.ls hash', function () {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        return ipfs.pin.ls(testHash)
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash,
              type: 'direct'
            }])
          })
      })

      it('.rm', function () {
        if (withJs) {
          console.log('Not supported in js-ipfs yet')
          this.skip()
        }

        return ipfs.pin.rm(testHash, { recursive: false })
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash
            }])
            return ipfs.pin.ls({ type: 'direct' })
          })
          .then((pinset) => {
            expect(pinset).to.not.deep.include({
              hash: testHash
            })
          })
      })
    })
  })
}

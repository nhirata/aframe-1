/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('camera', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('camera', 'active: false; userHeight: 1.6');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('adds a camera', function () {
      assert.equal(this.el.object3D.children[0].type, 'PerspectiveCamera');
    });

    test('sets sceneEl.camera', function () {
      var el = this.el;
      el.setAttribute('camera', 'active: true');
      assert.equal(el.sceneEl.camera, el.components.camera.camera);
    });
  });

  suite('update', function () {
    test('updates camera object3D', function () {
      var el = this.el;
      assert.notEqual(el.object3D.fov, 40);
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].fov, 65);
    });

    test('does not create a new camera object', function () {
      var el = this.el;
      var cameraId = el.object3D.children[0].uuid;
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].uuid, cameraId);
    });

    test('can update userHeight', function () {
      var el = this.el;
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 1.6, z: 0});
      el.setAttribute('camera', 'userHeight', 2.5);
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 2.5, z: 0});
    });
  });

  suite('saveCameraPose', function () {
    test('saves camera pose when entering VR with headset', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      cameraEl.components.camera.headsetConnected = true;
      sceneEl.emit('enter-vr');
      assert.shallowDeepEqual(cameraEl.components.camera.savedPose.position,
                              {x: 0, y: 1.6, z: 0});
    });

    test('does not save camera pose when entering VR without headset', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      cameraEl.components.camera.headsetConnected = false;
      sceneEl.emit('enter-vr');
      assert.notOk(cameraEl.components.camera.savedPose);
    });
  });

  suite('addHeightOffset', function () {
    test('adds userHeight offset', function () {
      var cameraEl = this.el;
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
    });

    test('adds userHeight offset on mobile', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      sceneEl.isMobile = true;
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
    });
  });

  suite('removeCameraPose (enter VR)', function () {
    test('removes the default offset with headset', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      cameraEl.components.camera.headsetConnected = true;
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
      sceneEl.emit('enter-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 0, z: 0});
    });

    test('does not remove the default offset without headset', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      cameraEl.components.camera.headsetConnected = false;
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
      sceneEl.emit('enter-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
    });

    test('does not remove the default offset on mobile', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      sceneEl.isMobile = true;
      cameraEl.components.camera.headsetConnected = true;
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
      sceneEl.emit('enter-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
    });
  });

  suite('restoreCameraPose (exit VR)', function () {
    test('restores camera pose with headset', function () {
      var cameraEl = this.el;
      var sceneEl = cameraEl.sceneEl;
      cameraEl.components.camera.headsetConnected = true;
      sceneEl.emit('enter-vr');
      cameraEl.setAttribute('position', {x: 6, y: 6, z: 6});
      sceneEl.emit('exit-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 0, y: 1.6, z: 0});
    });

    test('does not restore camera pose without headset', function () {
      var sceneEl = this.el.sceneEl;
      var cameraEl = this.el;
      cameraEl.components.camera.headsetConnected = false;
      sceneEl.emit('enter-vr');
      cameraEl.setAttribute('position', {x: 6, y: 6, z: 6});
      sceneEl.emit('exit-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 6, y: 6, z: 6});
    });
  });
});

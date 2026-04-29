import { Suspense, useEffect, useLayoutEffect, useRef, useState, Component } from 'react';
import { useGLTF } from '@react-three/drei';

const DRACO_DECODER = 'https://www.gstatic.com/draco/v1/decoders/';

// Module-level cache: url -> 'real' | 'missing' | undefined (still probing).
// Avoids the Vite SPA-fallback trap where /models/*.glb returns index.html (HTML, 200)
// and useGLTF then throws "Unexpected token '<'" on every render.
const probeCache = new Map();

function probe(url) {
  if (probeCache.has(url)) return probeCache.get(url);
  const promise = fetch(url, { method: 'HEAD' })
    .then((res) => {
      if (!res.ok) return 'missing';
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      // GLBs are served as application/octet-stream or model/gltf-binary.
      // The Vite SPA fallback returns text/html — that's our "missing" signal.
      if (ct.includes('text/html')) return 'missing';
      return 'real';
    })
    .catch(() => 'missing');
  probeCache.set(url, promise);
  promise.then((result) => probeCache.set(url, result));
  return promise;
}

function useAssetExists(url) {
  const [state, setState] = useState(() => {
    const cached = probeCache.get(url);
    return typeof cached === 'string' ? cached : 'unknown';
  });
  useEffect(() => {
    if (state !== 'unknown') return;
    let cancelled = false;
    Promise.resolve(probe(url)).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => { cancelled = true; };
  }, [url, state]);
  return state;
}

function GLB({ url, scale = 1, ...props }) {
  const { scene } = useGLTF(url, DRACO_DECODER);
  const ref = useRef();
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material.envMapIntensity = 0.9;
      }
    });
  }, [scene]);
  return <primitive ref={ref} object={scene.clone()} scale={scale} {...props} />;
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function Asset({ url, children, ...props }) {
  const status = useAssetExists(url);
  // While probing or if the file doesn't exist, just render the procedural fallback.
  // No useGLTF call → no Suspense throw → no error storm.
  if (status !== 'real') return children;
  return (
    <Boundary fallback={children}>
      <Suspense fallback={children}>
        <GLB url={url} {...props} />
      </Suspense>
    </Boundary>
  );
}

export function preloadAsset(url) {
  try { useGLTF.preload(url, DRACO_DECODER); } catch {}
}

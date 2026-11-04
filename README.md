# Depth Light

An Ink OS test app that takes **two inputs**: a colour image (including a transparent cutout) and its matching grayscale depth map. Drag a point light over the scene to change the shading. Adjust light height, brightness, ambient light, colour, depth strength and depth inversion. Save a full-size PNG copy with the source image's alpha preserved.

No original background image, external image API or backend runtime is required. An untrimmed transparent cutout works with the depth map of the same framing.

## Install

Requires Ink OS and its selected CLI connection. Node.js 24 or later.

```sh
git clone https://github.com/siliconjungle/ink-app-depth-light.git
cd ink-app-depth-light
npm test
npm run check
ink-os deploy .
```

No build or dependency installation. Deployment uses committed Git source.

## Use

Open **Depth Light** in the launcher. Use **Open image…** and **Open depth map…**, or their upload buttons. You can also right-click an image → Open with → Depth Light. Drop the image first, then its depth map; once both are loaded, dropping on an input card replaces that input.

Drag anywhere in the image to move the light. The light handle also supports arrow keys (Shift for larger steps). **Show original** compares against the unlit input; **Save PNG copy** always exports the lighting result. Cmd/Ctrl+S saves too. Inputs are never overwritten.

The app accepts a launch handoff with `imageId` and `depthId` (Ink file identities), so callers can open a prepared pair without additional file selection.

## Rendering and limits

- Estimates surface normals from depth gradients and applies a coloured point light with diffuse shading, distance falloff and ambient light in linear colour space.
- This is a depth-based lighting approximation. Existing lighting remains baked into the colour image. It does not reconstruct hidden geometry or compute cast shadows.
- Preserves alpha, including partially transparent pixels. Transparent background pixels do not introduce neighbouring silhouette gradients.
- Grayscale depth maps only, with a matching aspect ratio and framing. Different resolutions are resampled. Browser canvas decoding supports both the earlier 16-bit grayscale map and the V2 8-bit map, using an 8-bit sampled preview.
- Live preview uses at most 768 pixels on its longest edge. Saving renders at the image's original dimensions, up to 8 million pixels and 24 MiB per input/output.
- New depth maps may reverse bright-near/bright-far conventions; use **Invert depth** when needed. Strength zero gives flat-surface lighting.
- Source links, depth identity and lighting settings are attached to the saved PNG's Ink metadata. Closing the window discards unsaved controls.

## Development

`npm test` checks moving-light response, depth slopes, inversion, colour, original comparison, preserved alpha, unchanged source pixels and input validation. The Ink SDK/styles are copied from the existing MIT-licensed Flip & Rotate app; font notices remain bundled.

MIT. Third-party components retain their own notices.

## Quick preview

Displays supported files without starting the normal editing workflow. Ink OS can select this reader through `desktop.preview.fileTypes`, independently of Open with. Space opens the temporary preview from a selection; Escape or Space dismisses it, and arrow keys browse the supplied item order.

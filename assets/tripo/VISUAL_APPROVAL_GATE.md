# Visual approval gate

No generated mesh is accepted because one preview looks good.

Until an operator records `visual_approval_status: approved` in that asset's `qa-state.json`:

- Do not run rig-check, rig, or animation retarget.
- Do not run retopology, smart-low-poly, or decimate.
- Do not promote a GLB into `public/assets/models/`.
- Do not wire the file into the R3F runtime.

Runtime destination format after approval: **GLB**.

## Intake (from the v1.1 upload queue)

1. Inspect front, rear, both sides, top, and underside.
2. Check for holes, fused limbs, inflated bounds, inverted normals, stray geometry, and fake transparency.
3. Inventory materials, maps, dimensions, animation clips, bones, and triangle count.
4. Set scale in meters and a center-bottom pivot.
5. Separate any part that must rotate, recoil, hover, type, speak, or display cooldown state.
6. Replace mesh collision with a box, capsule, or authored compound proxy.
7. Test the GLB in the actual R3F camera at gameplay distance.
8. Record source image, generator/model version, date, settings, rights status, and final filename.

Place TensorFlow.js BLSTM export files here for direct Parkinson inference.

Required files:
- `model.json`
- Binary shard files referenced by `model.json` (for example `group1-shard1of1.bin`)

Expected runtime URL:
- `/models/parkinsons-blstm/model.json`

Conversion example (from a Keras `.h5` model):
```bash
tensorflowjs_converter --input_format keras \
  "parkmodel/Parkinsons-Detection/models/blstm_pahaw_model.h5" \
  "public/models/parkinsons-blstm"
```

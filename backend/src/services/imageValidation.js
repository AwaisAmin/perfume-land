// Verify the real file type from its content (magic bytes), not the
// client-supplied mimetype/extension which can be spoofed.
export function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { kind: "image", ext: "jpg", mime: "image/jpeg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { kind: "image", ext: "png", mime: "image/png" };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { kind: "image", ext: "webp", mime: "image/webp" };
  }
  return null;
}

// mp4 files start with a 4-byte box size, then an "ftyp" box type; webm (and
// other Matroska-family formats) start with the fixed EBML magic number.
export function detectVideoType(buffer) {
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return { kind: "video", ext: "mp4", mime: "video/mp4" };
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { kind: "video", ext: "webm", mime: "video/webm" };
  }
  return null;
}

export function detectMediaType(buffer) {
  return detectImageType(buffer) ?? detectVideoType(buffer);
}

const encoder = new TextEncoder();

export const FileMode = Object.freeze({
  Directory: 0o040000,
  File: 0o100644,
});

class FileDescriptor {
  constructor(file) {
    this.file = file;
    this.offset = 0;
  }

  isEof() {
    return this.offset >= this.file.size;
  }

  read(buffer, offset, length) {
    if (this.isEof()) {
      return 0;
    }

    const data = this.file._data.slice(offset, offset + length);
    const view = new Uint8Array(data);
    buffer.set(view, offset); // TODO
    this.offset += length;
    return data.byteLength;
  }
}

let cwd = "";

export const setWorkingDirectory = (path) => {
  cwd = path;
};

export const getWorkingDirectory = () => cwd;

const makeAbsPath = (path) => {
  if (path.startsWith("/")) {
    return path;
  }

  if (path.startsWith("./")) {
    return `${cwd}/${path.slice(2)}`;
  }

  if (path === ".") {
    return cwd;
  }

  return `${cwd}/${path}`;
};

const fds = [0, 1, 2];

export const findFd = (fd) => {
  return fds[fd];
};

export const closeFd = (fd) => {
  fds[fd] = null;
};

export class File {
  dev = 0;
  ino = 0;
  nlink = 0;
  uid = 0;
  gid = 0;
  rdev = 0;
  blksize = 0;
  blocks = 0;
  atimeMs = 0;
  mtimeMs = 0;
  ctimeMs = 0;
  constructor(mode, name, option = {
    url: null,
    text: null,
  }) {
    this._name = name;
    this.mode = mode;
    this._parent = null;
    this._children = new Map();
    this._url = option.url;
    if (option.text) {
      this._data = encoder.encode(option.text);
      this.size = this._data.byteLength;
    } else {
      this._data = new Uint8Array();
      this.size = 0;
    }
  }

  /**
   * @returns {boolean}
   */
  isDirectory() {
    return this.mode === FileMode.Directory;
  }

  async fetch() {
    if (this._url) {
      const res = await fetch(this._url);
      this._data = await res.arrayBuffer();
      this.size = this._data.byteLength;
    }
    return this;
  }

  addChildren(...files) {
    for (const file of files) {
      this.addChild(file);
    }
    return this;
  }

  addChild(file) {
    this._children.set(file._name, file);
    file._addParent(this);
    return this;
  }

  _addParent(file) {
    this._parent = file;
  }

  toString() {
    if (this._parent) {
      return `${this._parent}/${this._name}`;
    }
    return this._name;
  }

  findChild(name) {
    return this._children.get(name);
  }

  childNames() {
    return this._children.keys();
  }

  open() {
    const fd = new FileDescriptor(this);
    return fds.push(fd) - 1;
  }

  tree() {
    console.debug(`${this}`);
    for (const child of this._children.values()) {
      child.tree();
    }
  }
}

export const root = new File(FileMode.Directory, "");

export const stat = (path) => {
  const paths = makeAbsPath(path).split("/").slice(1);
  let file = root;
  for (const name of paths) {
    file = file.findChild(name);
    if (!file) {
      return null;
    }
  }
  return file;
};

export const makeDirectory = (path) => {
  makeAbsPath(path).split("/").slice(1).reduce((parent, name) => {
    let file = parent.findChild(name);
    if (!file) {
      file = new File(FileMode.Directory, name);
      parent.addChild(file);
    }
    return file;
  }, root);
};
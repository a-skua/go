import {
  closeFd,
  File,
  FileMode,
  findFd,
  getWorkingDirectory,
  makeDirectory,
  root,
  setWorkingDirectory,
  stat,
} from "./fs.js";
import "./wasm_exec.js";

const srcFmt = `
src/fmt/doc.go
src/fmt/errors.go
src/fmt/format.go
src/fmt/print.go
src/fmt/scan.go
`.trim().split("\n").map((s) =>
  new File(FileMode.File, s.split("/").pop(), {
    url: new URL(s, import.meta.url),
  }).fetch()
);

const srcRuntime = `
src/runtime/alg.go
src/runtime/arena.go
src/runtime/asan.go
src/runtime/asan0.go
src/runtime/atomic_pointer.go
src/runtime/auxv_none.go
src/runtime/cgo.go
src/runtime/cgo_mmap.go
src/runtime/cgo_ppc64x.go
src/runtime/cgo_sigaction.go
src/runtime/cgocall.go
src/runtime/cgocallback.go
src/runtime/cgocheck.go
src/runtime/chan.go
src/runtime/checkptr.go
src/runtime/compiler.go
src/runtime/complex.go
src/runtime/coro.go
src/runtime/covercounter.go
src/runtime/covermeta.go
src/runtime/cpuflags.go
src/runtime/cpuflags_amd64.go
src/runtime/cpuflags_arm64.go
src/runtime/cpuprof.go
src/runtime/cputicks.go
src/runtime/create_file_nounix.go
src/runtime/create_file_unix.go
src/runtime/debug.go
src/runtime/debugcall.go
src/runtime/debuglog.go
src/runtime/debuglog_off.go
src/runtime/debuglog_on.go
src/runtime/defs1_linux.go
src/runtime/defs1_netbsd_386.go
src/runtime/defs1_netbsd_amd64.go
src/runtime/defs1_netbsd_arm.go
src/runtime/defs1_netbsd_arm64.go
src/runtime/defs1_solaris_amd64.go
src/runtime/defs2_linux.go
src/runtime/defs3_linux.go
src/runtime/defs_aix.go
src/runtime/defs_aix_ppc64.go
src/runtime/defs_arm_linux.go
src/runtime/defs_darwin.go
src/runtime/defs_darwin_amd64.go
src/runtime/defs_darwin_arm64.go
src/runtime/defs_dragonfly.go
src/runtime/defs_dragonfly_amd64.go
src/runtime/defs_freebsd.go
src/runtime/defs_freebsd_386.go
src/runtime/defs_freebsd_amd64.go
src/runtime/defs_freebsd_arm.go
src/runtime/defs_freebsd_arm64.go
src/runtime/defs_freebsd_riscv64.go
src/runtime/defs_illumos_amd64.go
src/runtime/defs_linux.go
src/runtime/defs_linux_386.go
src/runtime/defs_linux_amd64.go
src/runtime/defs_linux_arm.go
src/runtime/defs_linux_arm64.go
src/runtime/defs_linux_loong64.go
src/runtime/defs_linux_mips64x.go
src/runtime/defs_linux_mipsx.go
src/runtime/defs_linux_ppc64.go
src/runtime/defs_linux_ppc64le.go
src/runtime/defs_linux_riscv64.go
src/runtime/defs_linux_s390x.go
src/runtime/defs_netbsd.go
src/runtime/defs_netbsd_386.go
src/runtime/defs_netbsd_amd64.go
src/runtime/defs_netbsd_arm.go
src/runtime/defs_openbsd.go
src/runtime/defs_openbsd_386.go
src/runtime/defs_openbsd_amd64.go
src/runtime/defs_openbsd_arm.go
src/runtime/defs_openbsd_arm64.go
src/runtime/defs_openbsd_mips64.go
src/runtime/defs_openbsd_ppc64.go
src/runtime/defs_openbsd_riscv64.go
src/runtime/defs_plan9_386.go
src/runtime/defs_plan9_amd64.go
src/runtime/defs_plan9_arm.go
src/runtime/defs_solaris.go
src/runtime/defs_solaris_amd64.go
src/runtime/defs_windows.go
src/runtime/defs_windows_386.go
src/runtime/defs_windows_amd64.go
src/runtime/defs_windows_arm.go
src/runtime/defs_windows_arm64.go
src/runtime/env_plan9.go
src/runtime/env_posix.go
src/runtime/error.go
src/runtime/exithook.go
src/runtime/extern.go
src/runtime/fastlog2.go
src/runtime/fastlog2table.go
src/runtime/fds_nonunix.go
src/runtime/fds_unix.go
src/runtime/float.go
src/runtime/hash32.go
src/runtime/hash64.go
src/runtime/heapdump.go
src/runtime/histogram.go
src/runtime/iface.go
src/runtime/lfstack.go
src/runtime/libfuzzer.go
src/runtime/lock_futex.go
src/runtime/lock_js.go
src/runtime/lock_sema.go
src/runtime/lock_wasip1.go
src/runtime/lockrank.go
src/runtime/lockrank_off.go
src/runtime/lockrank_on.go
src/runtime/malloc.go
src/runtime/map.go
src/runtime/map_fast32.go
src/runtime/map_fast64.go
src/runtime/map_faststr.go
src/runtime/mbarrier.go
src/runtime/mbitmap.go
src/runtime/mbitmap_allocheaders.go
src/runtime/mbitmap_noallocheaders.go
src/runtime/mcache.go
src/runtime/mcentral.go
src/runtime/mcheckmark.go
src/runtime/mem.go
src/runtime/mem_aix.go
src/runtime/mem_bsd.go
src/runtime/mem_darwin.go
src/runtime/mem_js.go
src/runtime/mem_linux.go
src/runtime/mem_plan9.go
src/runtime/mem_sbrk.go
src/runtime/mem_wasip1.go
src/runtime/mem_wasm.go
src/runtime/mem_windows.go
src/runtime/metrics.go
src/runtime/mfinal.go
src/runtime/mfixalloc.go
src/runtime/mgc.go
src/runtime/mgclimit.go
src/runtime/mgcmark.go
src/runtime/mgcpacer.go
src/runtime/mgcscavenge.go
src/runtime/mgcstack.go
src/runtime/mgcsweep.go
src/runtime/mgcwork.go
src/runtime/mheap.go
src/runtime/minmax.go
src/runtime/mkduff.go
src/runtime/mkfastlog2table.go
src/runtime/mklockrank.go
src/runtime/mkpreempt.go
src/runtime/mksizeclasses.go
src/runtime/mmap.go
src/runtime/mpagealloc.go
src/runtime/mpagealloc_32bit.go
src/runtime/mpagealloc_64bit.go
src/runtime/mpagecache.go
src/runtime/mpallocbits.go
src/runtime/mprof.go
src/runtime/mranges.go
src/runtime/msan.go
src/runtime/msan0.go
src/runtime/msize_allocheaders.go
src/runtime/msize_noallocheaders.go
src/runtime/mspanset.go
src/runtime/mstats.go
src/runtime/mwbbuf.go
src/runtime/nbpipe_pipe.go
src/runtime/nbpipe_pipe2.go
src/runtime/net_plan9.go
src/runtime/netpoll.go
src/runtime/netpoll_aix.go
src/runtime/netpoll_epoll.go
src/runtime/netpoll_fake.go
src/runtime/netpoll_kqueue.go
src/runtime/netpoll_solaris.go
src/runtime/netpoll_stub.go
src/runtime/netpoll_wasip1.go
src/runtime/netpoll_windows.go
src/runtime/nonwindows_stub.go
src/runtime/os2_aix.go
src/runtime/os2_freebsd.go
src/runtime/os2_openbsd.go
src/runtime/os2_plan9.go
src/runtime/os2_solaris.go
src/runtime/os3_plan9.go
src/runtime/os3_solaris.go
src/runtime/os_aix.go
src/runtime/os_android.go
src/runtime/os_darwin.go
src/runtime/os_darwin_arm64.go
src/runtime/os_dragonfly.go
src/runtime/os_freebsd.go
src/runtime/os_freebsd2.go
src/runtime/os_freebsd_amd64.go
src/runtime/os_freebsd_arm.go
src/runtime/os_freebsd_arm64.go
src/runtime/os_freebsd_noauxv.go
src/runtime/os_freebsd_riscv64.go
src/runtime/os_illumos.go
src/runtime/os_js.go
src/runtime/os_linux.go
src/runtime/os_linux_arm.go
src/runtime/os_linux_arm64.go
src/runtime/os_linux_be64.go
src/runtime/os_linux_generic.go
src/runtime/os_linux_loong64.go
src/runtime/os_linux_mips64x.go
src/runtime/os_linux_mipsx.go
src/runtime/os_linux_noauxv.go
src/runtime/os_linux_novdso.go
src/runtime/os_linux_ppc64x.go
src/runtime/os_linux_riscv64.go
src/runtime/os_linux_s390x.go
src/runtime/os_linux_x86.go
src/runtime/os_netbsd.go
src/runtime/os_netbsd_386.go
src/runtime/os_netbsd_amd64.go
src/runtime/os_netbsd_arm.go
src/runtime/os_netbsd_arm64.go
src/runtime/os_nonopenbsd.go
src/runtime/os_only_solaris.go
src/runtime/os_openbsd.go
src/runtime/os_openbsd_arm.go
src/runtime/os_openbsd_arm64.go
src/runtime/os_openbsd_libc.go
src/runtime/os_openbsd_mips64.go
src/runtime/os_openbsd_syscall.go
src/runtime/os_openbsd_syscall1.go
src/runtime/os_openbsd_syscall2.go
src/runtime/os_plan9.go
src/runtime/os_plan9_arm.go
src/runtime/os_solaris.go
src/runtime/os_unix.go
src/runtime/os_unix_nonlinux.go
src/runtime/os_wasip1.go
src/runtime/os_wasm.go
src/runtime/os_windows.go
src/runtime/os_windows_arm.go
src/runtime/os_windows_arm64.go
src/runtime/pagetrace_off.go
src/runtime/pagetrace_on.go
src/runtime/panic.go
src/runtime/panic32.go
src/runtime/pinner.go
src/runtime/plugin.go
src/runtime/preempt.go
src/runtime/preempt_nonwindows.go
src/runtime/print.go
src/runtime/proc.go
src/runtime/profbuf.go
src/runtime/proflabel.go
src/runtime/race.go
src/runtime/race0.go
src/runtime/rand.go
src/runtime/rdebug.go
src/runtime/retry.go
src/runtime/runtime.go
src/runtime/runtime1.go
src/runtime/runtime2.go
src/runtime/runtime_boring.go
src/runtime/rwmutex.go
src/runtime/security_aix.go
src/runtime/security_issetugid.go
src/runtime/security_linux.go
src/runtime/security_nonunix.go
src/runtime/security_unix.go
src/runtime/select.go
src/runtime/sema.go
src/runtime/sigaction.go
src/runtime/signal_386.go
src/runtime/signal_aix_ppc64.go
src/runtime/signal_amd64.go
src/runtime/signal_arm.go
src/runtime/signal_arm64.go
src/runtime/signal_darwin.go
src/runtime/signal_darwin_amd64.go
src/runtime/signal_darwin_arm64.go
src/runtime/signal_dragonfly.go
src/runtime/signal_dragonfly_amd64.go
src/runtime/signal_freebsd.go
src/runtime/signal_freebsd_386.go
src/runtime/signal_freebsd_amd64.go
src/runtime/signal_freebsd_arm.go
src/runtime/signal_freebsd_arm64.go
src/runtime/signal_freebsd_riscv64.go
src/runtime/signal_linux_386.go
src/runtime/signal_linux_amd64.go
src/runtime/signal_linux_arm.go
src/runtime/signal_linux_arm64.go
src/runtime/signal_linux_loong64.go
src/runtime/signal_linux_mips64x.go
src/runtime/signal_linux_mipsx.go
src/runtime/signal_linux_ppc64x.go
src/runtime/signal_linux_riscv64.go
src/runtime/signal_linux_s390x.go
src/runtime/signal_loong64.go
src/runtime/signal_mips64x.go
src/runtime/signal_mipsx.go
src/runtime/signal_netbsd.go
src/runtime/signal_netbsd_386.go
src/runtime/signal_netbsd_amd64.go
src/runtime/signal_netbsd_arm.go
src/runtime/signal_netbsd_arm64.go
src/runtime/signal_openbsd.go
src/runtime/signal_openbsd_386.go
src/runtime/signal_openbsd_amd64.go
src/runtime/signal_openbsd_arm.go
src/runtime/signal_openbsd_arm64.go
src/runtime/signal_openbsd_mips64.go
src/runtime/signal_openbsd_ppc64.go
src/runtime/signal_openbsd_riscv64.go
src/runtime/signal_plan9.go
src/runtime/signal_ppc64x.go
src/runtime/signal_riscv64.go
src/runtime/signal_solaris.go
src/runtime/signal_solaris_amd64.go
src/runtime/signal_unix.go
src/runtime/signal_windows.go
src/runtime/sigqueue.go
src/runtime/sigqueue_note.go
src/runtime/sigqueue_plan9.go
src/runtime/sigtab_aix.go
src/runtime/sigtab_linux_generic.go
src/runtime/sigtab_linux_mipsx.go
src/runtime/sizeclasses.go
src/runtime/slice.go
src/runtime/softfloat64.go
src/runtime/stack.go
src/runtime/stkframe.go
src/runtime/string.go
src/runtime/stubs.go
src/runtime/stubs2.go
src/runtime/stubs3.go
src/runtime/stubs_386.go
src/runtime/stubs_amd64.go
src/runtime/stubs_arm.go
src/runtime/stubs_arm64.go
src/runtime/stubs_linux.go
src/runtime/stubs_loong64.go
src/runtime/stubs_mips64x.go
src/runtime/stubs_mipsx.go
src/runtime/stubs_nonlinux.go
src/runtime/stubs_ppc64.go
src/runtime/stubs_ppc64x.go
src/runtime/stubs_riscv64.go
src/runtime/stubs_s390x.go
src/runtime/symtab.go
src/runtime/symtabinl.go
src/runtime/sys_arm.go
src/runtime/sys_arm64.go
src/runtime/sys_darwin.go
src/runtime/sys_darwin_arm64.go
src/runtime/sys_libc.go
src/runtime/sys_loong64.go
src/runtime/sys_mips64x.go
src/runtime/sys_mipsx.go
src/runtime/sys_nonppc64x.go
src/runtime/sys_openbsd.go
src/runtime/sys_openbsd1.go
src/runtime/sys_openbsd2.go
src/runtime/sys_openbsd3.go
src/runtime/sys_ppc64x.go
src/runtime/sys_riscv64.go
src/runtime/sys_s390x.go
src/runtime/sys_wasm.go
src/runtime/sys_x86.go
src/runtime/syscall2_solaris.go
src/runtime/syscall_aix.go
src/runtime/syscall_solaris.go
src/runtime/syscall_windows.go
src/runtime/tagptr.go
src/runtime/tagptr_32bit.go
src/runtime/tagptr_64bit.go
src/runtime/test_amd64.go
src/runtime/test_stubs.go
src/runtime/time.go
src/runtime/time_fake.go
src/runtime/time_nofake.go
src/runtime/timeasm.go
src/runtime/timestub.go
src/runtime/timestub2.go
src/runtime/tls_stub.go
src/runtime/tls_windows_amd64.go
src/runtime/trace.go
src/runtime/trace2.go
src/runtime/trace2buf.go
src/runtime/trace2cpu.go
src/runtime/trace2event.go
src/runtime/trace2map.go
src/runtime/trace2region.go
src/runtime/trace2runtime.go
src/runtime/trace2stack.go
src/runtime/trace2status.go
src/runtime/trace2string.go
src/runtime/trace2time.go
src/runtime/traceback.go
src/runtime/type.go
src/runtime/typekind.go
src/runtime/unsafe.go
src/runtime/utf8.go
src/runtime/vdso_elf32.go
src/runtime/vdso_elf64.go
src/runtime/vdso_freebsd.go
src/runtime/vdso_freebsd_arm.go
src/runtime/vdso_freebsd_arm64.go
src/runtime/vdso_freebsd_riscv64.go
src/runtime/vdso_freebsd_x86.go
src/runtime/vdso_in_none.go
src/runtime/vdso_linux.go
src/runtime/vdso_linux_386.go
src/runtime/vdso_linux_amd64.go
src/runtime/vdso_linux_arm.go
src/runtime/vdso_linux_arm64.go
src/runtime/vdso_linux_loong64.go
src/runtime/vdso_linux_mips64x.go
src/runtime/vdso_linux_ppc64x.go
src/runtime/vdso_linux_riscv64.go
src/runtime/vdso_linux_s390x.go
src/runtime/vlrt.go
src/runtime/wincallback.go
src/runtime/write_err.go
src/runtime/write_err_android.go
src/runtime/zcallback_windows.go
`.trim().split("\n").map((s) =>
  new File(FileMode.File, s.split("/").pop(), {
    url: new URL(s, import.meta.url),
  }).fetch()
);

const env = {
  GOROOT: "/usr/local/go",
};

root.addChildren(
  new File(FileMode.Directory, "tmp"),
  new File(FileMode.Directory, "usr").addChildren(
    new File(FileMode.Directory, "local").addChildren(
      new File(FileMode.Directory, "go").addChildren(
        new File(FileMode.Directory, "bin"),
        new File(FileMode.Directory, "src").addChildren(
          new File(FileMode.File, "command-line-arguments"),
          new File(FileMode.Directory, "runtime").addChildren(
            ...(await Promise.all(srcRuntime)),
          ),
          new File(FileMode.Directory, "fmt").addChildren(
            ...(await Promise.all(srcFmt)),
          ),
        ),
        await new File(FileMode.File, "go.env", {
          url: new URL("go.env", import.meta.url),
        }).fetch(),
      ),
    ),
  ),
  new File(FileMode.Directory, "sandbox").addChildren(
    new File(FileMode.File, "main.go", {
      text: `
package main

import "fmt"

func main() {
	fmt.Println("Hello, world!")
}
`.trim(),
    }),
  ),
);

globalThis.root = root;
root.tree();

setWorkingDirectory("/sandbox");

const enosys = () => {
  const err = new Error("not implemented");
  err.code = "ENOSYS";
  return err;
};

const eeof = () => {
  const err = new Error("EOF");
  err.code = "EEOF";
  return err;
};

globalThis.fs = {
  ...globalThis.fs,
  open(path, _flags, _mode, callback) {
    const f = stat(path);
    console.debug(f);
    if (!f) {
      callback(enosys());
      return;
    }

    callback(null, f.open());
  },
  fstat(fd, callback) {
    const f = findFd(fd);
    if (!fd) {
      callback(enosys());
      return;
    }
    callback(null, f.file);
  },
  read(fd, buffer, offset, length, _position, callback) {
    const f = findFd(fd);
    if (!f) {
      callback(enosys());
      return;
    }

    if (f.isEof()) {
      callback(eeof(), 0);
      return;
    }

    callback(null, f.read(buffer, offset, length));
  },
  close(fd, callback) {
    closeFd(fd);
    callback(null);
  },
  stat(path, callback) {
    const file = stat(path);
    if (!file) {
      callback(enosys());
      return;
    }
    callback(null, file);
  },
  lstat(path, callback) {
    const file = stat(path);
    if (!file) {
      callback(enosys());
      return;
    }
    callback(null, file);
  },
  mkdir(path, _mode, callback) {
    makeDirectory(path);
    callback(null);
  },
  readdir(path, callback) {
    const file = stat(path);
    if (!file) {
      callback(enosys());
      return;
    }
    callback(null, file.childNames());
  },
};

globalThis.process = {
  ...globalThis.process,
  cwd() {
    return getWorkingDirectory();
  },
};

const path = new URL("go.wasm", import.meta.url);
const wasmmod = await WebAssembly.compileStreaming(fetch(path));

export default async function (...args) {
  const go = new Go();
  const instance = await WebAssembly.instantiate(
    wasmmod,
    go.importObject,
  );

  go.env = env;

  go.argv = ["go", ...args];
  go.run(instance);
}

// DEBUG
for (const [k, v] of Object.entries(globalThis.fs)) {
  if (typeof v === "function" && !["write", "writeSync"].includes(k)) {
    globalThis.fs[k] = ((f) => (...args) => {
      console.debug(`fs.${k}(${args.join(", ")})`);
      return f(...args);
    })(v);
  }
}

for (const [k, v] of Object.entries(globalThis.process)) {
  if (typeof v === "function") {
    globalThis.process[k] = ((f) => (...args) => {
      console.debug(`process.${k}(${args.join(", ")})`);
      return f(...args);
    })(v);
  }
}
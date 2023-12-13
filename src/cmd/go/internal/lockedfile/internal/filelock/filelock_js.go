package filelock

type lockType int32

func (lt lockType) Int32() int32 {
	return int32(lt)
}

const (
	LOCK_SH lockType = 1 << iota // LOCK_SH 1 /* shared lock */
	LOCK_EX                      // LOCK_EX 2 /* exclusive lock */
	LOCK_NB                      // LOCK_NB 4 /* don't block when locking */
	LOCK_UN                      // LOCK_UN 8 /* unlock */
	// aliases
	readLock  = LOCK_SH
	writeLock = LOCK_EX
)

//go:wasmimport syscall flock
func syscall_flock(fd int32, lockType int32)

func lock(f File, lt lockType) error {
	syscall_flock(int32(f.Fd()), lt.Int32())
	return nil
}

func unlock(f File) error {
	return lock(f, LOCK_UN)
}
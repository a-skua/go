.PHONY: all
all: web/go.wasm web/wasm_exec.js

.PHONY: build
build:
	cd src; GOOS=js GOARCH=wasm ./make.bash

bin/js_wasm/go: build

web/go.wasm: bin/js_wasm/go
	cp $< $@

web/wasm_exec.js: $(shell go env GOROOT)/misc/wasm/wasm_exec.js
	cp $< $@

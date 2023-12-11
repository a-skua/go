.PHONY: all
all: web/go.wasm web/wasm_exec.js web/go.env web/src

.PHONY: build
build:
	cd src; GOOS=js GOARCH=wasm ./make.bash

web/go.wasm: bin/js_wasm/go
	cp $< $@

web/wasm_exec.js: $(shell go env GOROOT)/misc/wasm/wasm_exec.js
	cp $< $@

web/go.env: go.env
	ln -s $(PWD)/$< $(PWD)/$@

web/src: src
	ln -s $(PWD)/$< $(PWD)/$@
serve:
	npm start

deps:
	npm install

deploy-init:
	npm run deploy

build:
	GENERATE_SOURCEMAP=true npm run build
	echo "etherscapes.io" > build/CNAME

deploy:
	git push origin `git subtree split --prefix build master`:gh-pages --force

.PHONY: build

generate-assets:
	npm run build
	git add builds/ dist/
	git commit -m "chore: generate assets"
	git push

release:
	git push
	git push --tags
	gh release create --latest --generate-notes

publish-patch: generate-assets
	bun pm version patch
	npm publish
	$(MAKE) release

publish-minor: generate-assets
	bun pm version minor
	npm publish
	$(MAKE) release


generate-assets:
	git push
	npm run build
	git add builds/ dists/
	git commit -m "chore: generate assets"

publish-patch: generate-assets
	bun pm version patch
	npm publish

publish-minor: generate-assets
	bun pm version minor
	npm publish
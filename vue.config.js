module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: false,
			preload: 'src/preload.js',
			builderOptions: {
				appId: "pl.statica.taigaexport",
				productName: "Taiga Export",
				directories: {
					output: "dist_electron",
				},
				artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
				mac: {
					target: ["dmg", "zip"],
					icon: "build/icon.png",
				},
				win: {
					target: "portable",
					icon: "build/icon.ico",
				}
			},
		},
	}
};

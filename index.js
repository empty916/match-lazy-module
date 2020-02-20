const glob = require("glob");
const fs = require("fs");

function pipe(...funcs) {
	if (funcs.length === 0) {
		return arg => arg;
	}

	if (funcs.length === 1) {
		return funcs[0];
	}

	return funcs.reduce((a, b) => (...args) => b(a(...args)));
}

/**
 * 
 * @param {*} param0 {
 * 	projectPath: 项目地址，
 *  moduleBasePath： 需要匹配模块的目录
 *  moduleDirName：需要匹配模块的的目录名字
 *  matchFileName：需要匹配模块下的文件名
 *  slash：路径分割符号, 默认是'/'
 *  importPathPrefix：导出模块的路径前缀
 *  fileName：生成文件的全路径
 * }
 */
function matchLazyModule({
	projectPath,
	moduleBasePath,
	moduleDirName,
	matchFileName,
	slash = '/',
	importPathPrefix,
	fileName
}) {
	// utils
	const removeModuleDirName = p =>
		p.replace(`${slash}${moduleDirName}${slash}`, "");
	const removeMatchedFileName = p =>
		p.replace(`${slash}${matchFileName}`, "");
	const toCamelName = p =>
		p
			.replace(new RegExp(`\\${slash}([a-zA-z])`, "g"), (...arg) =>
				arg[1].toUpperCase()
			)
			.replace(new RegExp(`\-([a-zA-z])`, "g"), (...arg) =>
				arg[1].toUpperCase()
			);
	const firstCharToLowerCase = str =>
		str.slice(0, 1).toLowerCase() + str.slice(1);

	const formatModuleName = pipe(
		removeModuleDirName,
		removeMatchedFileName,
		toCamelName,
		firstCharToLowerCase
	);
	// 首字母小写

	const getMatchedFile = () =>
		glob.sync(`${moduleBasePath}${slash}**${slash}${matchFileName}.*`);
	const replaceAbsPath = p => p.replace(projectPath, "");
	const addRelativePathHeader = p => `${importPathPrefix}${p}`;
	const createFileData = data => `
export default {
	modules: {
		${data}
	},
};
`;

	const removeExt = str => str.split(".")[0];
	const authGetModule = () => {
		console.log(`${moduleBasePath}${slash}**${slash}${matchFileName}.*`);
		const matchFile = getMatchedFile();

		const formatModuleNames = matchFile
			.map(replaceAbsPath)
			.map(formatModuleName);

		const addImportStr = (p, index) =>
			`${removeExt(
				formatModuleNames[index]
			)}: () => import(/* webpackChunkName:"${removeExt(
				formatModuleNames[index]
			)}" */ '${removeExt(p)}'),`;

		const moduleImportStr = matchFile
			.map(replaceAbsPath)
			.map(addRelativePathHeader)
			.map(addImportStr);

		const lazyLoadModuleConfigFileData = createFileData(
			moduleImportStr.join("\n		")
		);
		try {
			const filePath = fileName;
			if (fs.existsSync(filePath)) {
				const lastFileData = fs.readFileSync(filePath, "utf-8");
				if (lastFileData === lazyLoadModuleConfigFileData) {
					return true;
				}
			}
			return fs.writeFileSync(filePath, lazyLoadModuleConfigFileData);
		} catch (error) {
			console.log(error);
		}
	};
	return authGetModule;
};

module.exports = matchLazyModule;

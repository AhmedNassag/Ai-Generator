const fs = require('fs');
modelCreation('Api', 'src/API/', 'Temp/api.txt');
modelCreation('Page', 'src/views/Page/', 'Temp/page.txt');
modelCreation('Router', 'src/router/modules/', 'Temp/router.txt');
add();
async function modelCreation(type, path, temp) {
    const name = process.argv[2];
    const namekebab = process.argv[2].replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
    let nameFillable = [];

    const newPath = path + name;
    await fs.mkdirSync(newPath);

    let ex = '.ts';
    if (type == 'Page') ex = ".vue"
    const ds = newPath + "/" + name + ex;
    fs.readFile(temp, 'utf8', function (err, data) {
        if (err) throw err;
        const text = data.replaceAll("@@Name@@", name)
            .replaceAll("@@Namekebab@@", namekebab)
            .replaceAll("@@name@@", name.toLocaleLowerCase());
        //  console.log(ds,newPath);

        fs.writeFile(ds, text
            , function (err) {
                if (err) throw err;
                console.log(type + ' created successfully.');
            });
    })

}
async function addtext(file_path, new_text, bf) {


    let data = await fs.readFileSync(file_path);
    var file_content = data.toString();
    const position = file_content.indexOf(bf) + bf.length+2;
    file_content = file_content.substring(position);
    var file = fs.openSync(file_path, 'r+');
    var bufferedText = new Buffer(new_text + file_content);
    await fs.writeSync(file, bufferedText, 0, bufferedText.length, position);
    await fs.close(file);
}
async function add() {
    await addtext('src/router/index.ts', `import @@Name@@ from '@/router/modules/@@Name@@/@@Name@@';\n`.replaceAll("@@Name@@", process.argv[2]), '////import');
    await addtext('src/router/index.ts', `        ...@@Name@@,\n`.replaceAll("@@Name@@", process.argv[2]), "//new");

}
// // console.log(process.argv[2])
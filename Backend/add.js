import fs from 'fs';
modelCreation('Model', 'app/Models/', 'Temp/model.txt');
modelCreation('Repository', 'app/Repositories/Eloquent/', 'Temp/repositories.txt');
modelCreation('Service', 'app/Services/Eloquent/', 'Temp/services.txt');
modelCreation('Controller', 'app/Http/Controllers/', 'Temp/controller.txt');
modelCreation('Routes', 'routes/API/Modules/', 'Temp/route.txt');
modelCreation('ControllerTest', 'tests/Unit/', 'Temp/test.txt');
addtext('routes/API/index.php', "     @include('Modules/@@Name@@/@@Name@@Routes.php');".replaceAll("@@Name@@", process.argv[2]))

async function modelCreation(type, path, temp) {
    const name = process.argv[2];
    const namekebab = process.argv[2].replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
    let nameFillable = [];
    if (process.argv[3]) {
        for (let index = 3; index < process.argv.length; index++) {
            nameFillable.push(`'${process.argv[index]}'`);
        }
    }
    // nameFillable = process.argv[3];

    const newPath = path + name;
    await fs.mkdirSync(newPath);

    let ds = newPath + "/" + name + type + '.php';
    if (type=='Model') {
        ds = newPath + "/" + name  + '.php';
    }
    fs.readFile(temp, 'utf8', function (err, data) {
        if (err) throw err;
        const text = data.replaceAll("@@Name@@", name)
            .replaceAll("@@Namekebab@@", namekebab)
            .replaceAll("@@NameFillable@@", nameFillable.toString());
        //  console.log(ds,newPath);

        fs.writeFile(ds, text
            , function (err) {
                if (err) throw err;
                console.log(type + ' created successfully.');
            });
    })

}
function addtext(file_path, new_text) {


    fs.readFile(file_path, function read(err, data) {
        if (err) {
            throw err;
        }
        var file_content = data.toString();
        const position = file_content.indexOf("//new") + 6;
        file_content = file_content.substring(position);
        var file = fs.openSync(file_path, 'r+');
        var bufferedText = new Buffer(new_text + file_content);
        fs.writeSync(file, bufferedText, 0, bufferedText.length, position);
        fs.close(file);
    });
}
// // console.log(process.argv[2])

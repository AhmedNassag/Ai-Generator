const files: string[] = [
  "User",

];

const customUrl: string[] = [

];

type APIClass = {
  default: any;
};

const loadEntries = (files: string[]): Promise<APIClass[]> =>
  Promise.all(files.map((file) => import(`/src/API/${file}/${file}.js`)));

// Define the type for APIsObj
let APIsObj: Record<string, any> = {};

loadEntries(files).then((entries: APIClass[]) => {
  files.forEach((element, index) => {
    APIsObj[element] = entries[index].default;
  });
});

export { APIsObj, customUrl };

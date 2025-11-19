const bookAbbreviations = {
    // Antiguo Testamento
    "GENESIS": "Gn",
    "EXODO": "Ex",
    "LEVITICO": "Lv",
    "NUMEROS": "Nm",
    "DEUTERONOMIO": "Dt",
    "JOSUE": "Jos",
    "JUECES": "Jue",
    "RUT": "Rt",
    "PRIMER LIBRO DE SAMUEL": "1 S",
    "SEGUNDO LIBRO DE SAMUEL": "2 S",
    "PRIMER LIBRO DE LOS REYES": "1 R",
    "SEGUNDO LIBRO DE LOS REYES": "2 R",
    "PRIMER LIBRO DE LAS CRONICAS": "1 Cr",
    "SEGUNDO LIBRO DE LAS CRONICAS": "2 Cr",
    "ESDRAS": "Esd",
    "NEHEMIAS": "Neh",
    "TOBIAS": "Tob", // Missing from user list
    "JUDIT": "Jdt", // Missing from user list
    "ESTER": "Est",
    "ESTER SUPLEMENTOS GRIEGOS": "Est G", // Missing from user list
    "PRIMER LIBRO DE LOS MACABEOS": "1 Mac", // Missing from user list
    "SEGUNDO LIBRO DE LOS MACABEOS": "2 Mac", // Missing from user list
    "JOB": "Job",
    "SALMOS": "Sal",
    "PROVERBIOS": "Pr",
    "ECLESIASTES": "Ec",
    "CANTAR DE LOS CANTARES": "Cnt",
    "SABIDURIA": "Sab", // Missing from user list
    "ECLESIASTICO": "Eclo", // Missing from user list
    "ISAIAS": "Is",
    "JEREMIAS": "Jer",
    "LAMENTACIONES": "Lm",
    "BARUC": "Bar", // Missing from user list
    "CARTA DE JEREMIAS": "CJer", // Missing from user list
    "EZEQUIEL": "Ez",
    "DANIEL": "Dn",
    "DANIEL SUPLEMENTOS GRIEGOS": "Dn G", // Missing from user list
    "OSEAS": "Os",
    "JOEL": "Jl",
    "AMOS": "Am",
    "ABDIAS": "Abd",
    "JONAS": "Jon",
    "MIQUEAS": "Miq",
    "NAHUM": "Nah",
    "HABACUC": "Hab",
    "SOFONIAS": "Sof",
    "AGEO": "Hag",
    "ZACARIAS": "Zac",
    "MALAQUIAS": "Mal",

    // Nuevo Testamento
    "EVANGELIO SEGUN SAN MATEO": "Mt",
    "EVANGELIO SEGUN SAN MARCOS": "Mc",
    "EVANGELIO SEGUN SAN LUCAS": "Lc",
    "EVANGELIO SEGUN SAN JUAN": "Jn",
    "HECHOS DE LOS APOSTOLES": "Hch",
    "CARTA A LOS ROMANOS": "Ro",
    "PRIMERA CARTA A LOS CORINTIOS": "1 Co",
    "SEGUNDA CARTA A LOS CORINTIOS": "2 Co",
    "CARTA A LOS GALATAS": "Gl",
    "CARTA A LOS EFESIOS": "Ef",
    "CARTA A LOS FILIPENSES": "Flp",
    "CARTA A LOS COLOSENSES": "Col",
    "PRIMERA CARTA A LOS TESALONICENSES": "1 Ts",
    "SEGUNDA CARTA A LOS TESALONICENSES": "2 Ts",
    "PRIMERA CARTA A TIMOTEO": "1 Ti",
    "SEGUNDA CARTA A TIMOTEO": "2 Ti",
    "CARTA A TITO": "Tit",
    "CARTA A FILEMON": "Flm",
    "CARTA A LOS HEBREOS": "Heb",
    "CARTA DE SANTIAGO": "Stg",
    "PRIMERA CARTA DE SAN PEDRO": "1 P",
    "SEGUNDA CARTA DE SAN PEDRO": "2 P",
    "PRIMERA CARTA DE SAN JUAN": "1 Jn",
    "SEGUNDA CARTA DE SAN JUAN": "2 Jn",
    "TERCERA CARTA DE SAN JUAN": "3 Jn",
    "CARTA DE SAN JUDAS": "Jud",
    "APOCALIPSIS": "Ap"
};

export const getAbbreviation = (bookName) => {
    if (!bookName) return "";
    // Try exact match first
    if (bookAbbreviations[bookName]) return bookAbbreviations[bookName];

    // Try uppercase match
    const upperName = bookName.toUpperCase();
    if (bookAbbreviations[upperName]) return bookAbbreviations[upperName];

    // Fallback: Return first 3 chars or the name itself if not found
    return bookName.substring(0, 3);
};

export default bookAbbreviations;

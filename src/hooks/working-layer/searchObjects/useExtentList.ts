const useExtentList = () => {
    const extentList = [
        { value: "map_extent", title: "Dans l'emprise de la carte" },
        { value: "table_extent", title: "Dans toute la table" },
        { value: "-140490.79010933288,5495484.0515884925,35072.34130055891,5712276.781105277", title: "Emprise GIRONDE" },
        { value: "472380.9091306107,5693313.325396436,574323.6448182202,5829206.781548299", title: "Emprise RHONE" },
        { value: "515258.6129961618,5925944.192744665,517708.54786891094,5929706.130448566", title: "Emprise PARIS-L'HÔPITAL" },
        { value: "247598.9382792816,6243650.290757916,274689.9704357051,6258250.4925969895", title: "Emprise PARIS" },
        { value: "170904.64519932898,5370391.657771829,326996.7928416714,5496611.511457663", title: "Emprise TARN" },
        { value: "257172.79121822148,6222131.543105547,291087.93242682354,6251377.421245064", title: "Emprise VAL-DE-MARNE" },
        { value: "-6880223.769225647,-2438073.2931485106,6215710.773576275,6637052.134916614", title: "Emprise FRANCE" },
        { value: "-6966115.954211671,1732693.6933128254,-6708370.294834058,1916142.5611972485", title: "Emprise Guadeloupe" },
        { value: "161111.0415257984,6126931.381655783,395809.11308550456,6315905.785257943", title: "Emprise ILE-DE-FRANCE" },
    ];
    return extentList;
};

export default useExtentList;

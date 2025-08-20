import { YTPState } from "../Interfaces/states";
import { useEffect, useState } from "react";

export function CSVLoader(url: string): { state: YTPState, setState: React.Dispatch<React.SetStateAction<YTPState>> } {
    const [state, setState] = useState<YTPState>({
        prev_standings: {},
        csv_loaded: false,
        limit_display: false,
        display_gender: false
    });
    useEffect(() => {
        const fetchResults = async () => {
            await fetch(url)
                .then(response => {
                    if (response.status !== 200) {
                        return "";
                    }
                    return response.text();
                })
                .then(data => {
                    const rows = data.split('\n');
                    const headers = rows[0].split(',');
                    var first_ix = -1;
                    var last_ix = -1;
                    var old_ix = -1;
                    var seward_ix = -1;
                    var tiger_ix = -1;
                    var category_ix = -1;
                    for (let i = 0; i < headers.length; i++) {
                        const head = headers[i].trim().toLocaleLowerCase()
                        if (head === "first") {
                            first_ix = i;
                        } else if (head === "last") {
                            last_ix = i;
                        } else if (head === "tiger score") {
                            tiger_ix = i;
                        } else if (head === "seward score") {
                            seward_ix = i;
                        } else if (head === "highest score") {
                            old_ix = i;
                        } else if (head === "category") {
                            category_ix = i;
                        }
                    }
                    for (let i = 1; i < rows.length; i++) {
                        const columns = rows[i].split(',');
                        if (first_ix >= 0 && last_ix >= 0 && columns[first_ix].trim().length > 0 && columns[last_ix].trim().length > 0) {
                            const old = old_ix >= 0 ? +columns[old_ix] : 0;
                            const tiger = tiger_ix >= 0 ? +columns[tiger_ix] : 0;
                            const seward = seward_ix >= 0 ? +columns[seward_ix] : 0;
                            const category = category_ix >= 0 ? columns[category_ix] : "YTP Unknown 0-140"
                            const splitCategory = category.split(' ')
                            var gender = ""
                            if (splitCategory[1] !== undefined) {
                                if (splitCategory[1] === "Female") {
                                    gender = "F"
                                } else if (splitCategory[1] === "Male") {
                                    gender = "M"
                                } else if (splitCategory[1] !== "Unknown") {
                                    gender = "X"
                                }
                            }
                            var age = 140
                            var age_group = ""
                            if (splitCategory[2] !== undefined) {
                                age_group = `${splitCategory[1]} ${splitCategory[2]}`.trim()
                                if (splitCategory[2].startsWith('8')) {
                                    age = 8
                                } else if (splitCategory[2].endsWith('10')) {
                                    age = 10
                                } else if (splitCategory[2].endsWith('12')) {
                                    age = 12
                                } else if (splitCategory[2].endsWith('14')) {
                                    age = 14
                                } else if (splitCategory[2].endsWith('16')) {
                                    age = 16
                                } else if (splitCategory[2].endsWith('18')) {
                                    age = 18
                                }
                            }
                            state.prev_standings[`${columns[first_ix]} ${columns[last_ix]}`] = {
                                highest_score: old,
                                tiger_score: tiger,
                                seward_score: seward,
                                age: age,
                                gender: gender,
                                age_group: age_group,
                            }
                        }
                    }
                    state.csv_loaded = true
                })
                .catch(error => {
                    console.error("There was an error!", error)
                });
            setState({
                ...state,
                csv_loaded: true
            });
        };
        fetchResults().catch(() => {});
    }, []);
    return { state: state, setState: setState };
}
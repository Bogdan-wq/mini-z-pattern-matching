const createNormalObject = (right) => {
    return right
        .properties
        .map(({ key,value }) => {
            return [key.name,value.value]
        })
        .reduce((total,current) => {
            return {
                ...total,
                [current[0]]:current[1]
            }
        },{})
}

module.exports = createNormalObject;
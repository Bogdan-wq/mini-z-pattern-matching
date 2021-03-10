const createNormalArray = (right) => {
    return right.elements.map(({ value }) => value)
}

module.exports = createNormalArray;
const traverse = require('@babel/traverse').default;
const parseToAst = require('@babel/parser').parse;
const deepEqual = require('deep-equal');
const createNormalArray = require('./createNormalArray')
const createNormalObject = require('./createNormalObject')


const match = (x) => {
    return (...matches) => {

        const values = [];

        [...matches].forEach(patternCallback => {
            traverse(parseToAst(patternCallback.toString()),{
                ArrowFunctionExpression:({ node }) => {

                    const right = node.params[0].right;
                    const baseObject = { callback:patternCallback }

                    if(right) {
                        const rightName = node.params[0].right?.name;
                        if(right.type === 'ArrayExpression') {
                            const normalArray = createNormalArray(right)

                            if(deepEqual(x,normalArray)) {
                                values.push({
                                    ...baseObject,
                                    value:normalArray,
                                })
                            }

                        } else if(right.type === 'ObjectExpression') {
                            const normalObject = createNormalObject(right)

                            if(deepEqual(x,normalObject)) {
                                values.push({
                                    ...baseObject,
                                    value:normalObject,
                                })
                            }

                        } else {

                            if(right.value === x) {
                                values.push({
                                    ...baseObject,
                                    value:right.value,
                                });
                            }

                        }


                        if(rightName && typeof(x) === rightName.toLowerCase()) {
                            values.push({
                                ...baseObject,
                                value:x,
                            });
                        }
                    } else {
                        values.push({
                            ...baseObject,
                            value:x,
                        })
                    }
                }
            })
        })

        const expressions = values
            .map(obj => obj.callback(obj.value))

        return (expressions.length > 1 ? expressions : expressions[0]) || [];
    }
}

console.log(match(1)(
    ((x = Number) => `Value ${x * 2}`),
    ((x = 1) => `Value ${x}8`),
    (x) => `Normal Value ${x}`
))
const traverse = require('@babel/traverse').default;
const parseToAst = require('@babel/parser').parse;
const deepEqual = require('deep-equal');


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
                            const normalArray = right
                                .elements
                                .map(({ value }) => value)

                            values.push({
                                ...baseObject,
                                isValid:deepEqual(x,normalArray),
                                value:normalArray,
                            })

                        } else if(right.type === 'ObjectExpression') {
                            const normalObject = right
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

                            values.push({
                                ...baseObject,
                                isValid:deepEqual(x,normalObject),
                                value:normalObject,
                            })


                        } else {
                            values.push({
                                ...baseObject,
                                isValid:right.value === x,
                                value:right.value,
                            });
                        }


                        if(rightName) {
                            values.push({
                                ...baseObject,
                                isValid:() => typeof(x) === rightName.toLowerCase(),
                                value:x,
                            });
                        }
                    } else {
                        values.push({
                            ...baseObject,
                            isValid:true,
                        })
                    }
                }
            })
        })

        const expressions = values
            .filter((obj) => obj.isValid)
            .map(obj => obj.callback(obj.value))

        return (expressions.length > 1 ? expressions : expressions[0]) || [];
    }
}

console.log(match(1)(
    ((x = Number) => `Value ${x * 2}`),
    ((x = 1) => `Value ${x}8`),
    (x) => `Normal Value`
))
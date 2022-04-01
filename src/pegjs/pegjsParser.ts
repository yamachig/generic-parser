/*
Based on the PEG.js Grammar released under the MIT license
https://github.com/pegjs/pegjs/blob/b7b87ea8aeeaa1caf096e2da99fd95a971890ca1/LICENSE
*/

import pegType from "../pegjs/pegjsTypings/pegjs";
import peg from "../pegjs/optionalPegjs";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const util = peg!.util;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ast = peg!.ast;

import { getMemorizedStringOffsetToPos, Rule, Empty, ValueOfRule } from "../core";
import { RuleFactory } from "../rules/factory";

type Env = ReturnType<typeof initializer>;
type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

const factory = new RuleFactory<string, Env>();

const initializer = (options: Record<string | number | symbol, unknown>) => {
    let currentStart = 0;
    let currentEnd = 0;
    let currentTarget = "";
    const registerCurrentRangeTarget = (start: number, end: number, target: string) => {
        currentStart = start;
        currentEnd = end;
        currentTarget = target;
    };
    const location = () => ({
        start: offsetToPos(currentTarget, currentStart),
        end: offsetToPos(currentTarget, currentEnd),
    });
    const offsetToPos = getMemorizedStringOffsetToPos();

    // * |    // Used as a shorthand property name for `LabeledExpression`
    // * |    const pick = true;

    const pick = true;

    // * |    // Used by `LabelIdentifier` to disallow the use of certain words as labels
    // * |    const RESERVED_WORDS = {};

    const RESERVED_WORDS: Record<string, boolean> = {};

    // * |    // Populate `RESERVED_WORDS` using the optional option `reservedWords`
    // * |    const reservedWords = options.reservedWords || util.reservedWords;
    // * |    if ( Array.isArray( reservedWords ) ) reservedWords.forEach( word => {
    // * |
    // * |        RESERVED_WORDS[ word ] = true;
    // * |
    // * |    } );

    const reservedWords = options.reservedWords || util.reservedWords;
    if ( Array.isArray( reservedWords ) ) reservedWords.forEach( word => {

        RESERVED_WORDS[ word ] = true;

    } );

    // * |    // Helper to construct a new AST Node
    // * |    function createNode( type, details ) {
    // * |
    // * |        const node = new ast.Node( type );
    // * |        if ( details === null ) return node;
    // * |
    // * |        util.extend( node, details );
    // * |        return util.enforceFastProperties( node );
    // * |
    // * |    }

    function createNode( type: string, details: Record<string, unknown> = {} ) {

        const node = new ast.Node( type, location() );
        if ( details === null ) return node;

        util.extend( node, details );
        return util.enforceFastProperties( node );

    }

    // * |    // Used by `addComment` to store comments for the Grammar AST
    // * |    const comments = options.extractComments ? {} : null;

    const comments: pegType.ast.CommentMap | null = options.extractComments ? {} : null;

    // * |    // Helper that collects all the comments to pass to the Grammar AST
    // * |    function addComment( text, multiline ) {
    // * |
    // * |        if ( options.extractComments ) {
    // * |
    // * |            const loc = location();
    // * |
    // * |            comments[ loc.start.offset ] = {
    // * |                text: text,
    // * |                multiline: multiline,
    // * |                location: loc,
    // * |            };
    // * |
    // * |        }
    // * |
    // * |        return text;
    // * |
    // * |    }

    function addComment( text: string, multiline: boolean ) {

        if ( options.extractComments && comments !== null ) {

            const loc = location();

            comments[ loc.start.offset ] = {
                text: text,
                multiline: multiline,
                location: loc,
            };

        }

        return text;

    }


    return {
        offsetToPos,
        getStack: () => "",
        registerCurrentRangeTarget,
        options,
        pick,
        RESERVED_WORDS,
        reservedWords,
        createNode,
        comments,
        addComment,
    };
};

// * |// ---- Syntactic Grammar -----

// * |Grammar
// * |  = __ initializer:(@Initializer __)? rules:(@Rule __)+ {
// * |
// * |        return new ast.Grammar( initializer, rules, comments );
// * |
// * |    }

const $Grammar = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $__)
            )
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $Initializer)
                        )
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                    )
                )
            , "initializer")
            .and(r => r
                .oneOrMore(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $Rule)
                        )
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                    )
                )
            , "rules")
        )
    , (({ comments, location, initializer, rules }) => {
        return new ast.Grammar( initializer as pegType.ast.Initializer | void, rules, comments as pegType.ast.CommentMap | void, location() );
    })
    )
    ;

// * |Initializer
// * |  = code:CodeBlock EOS {
// * |
// * |        return createNode( "initializer", { code } );
// * |
// * |    }

const $Initializer = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $CodeBlock)
            , "code")
            .and(r => r
                .ref(() => $EOS)
            )
        )
    , (({ createNode, code }) => {
        return createNode( "initializer", { code } ) as pegType.ast.Initializer;
    })
    )
    ;

// * |Rule
// * |  = name:Identifier __ displayName:(@StringLiteral __)? "=" __ expression:Expression EOS {
// * |
// * |        if ( displayName )
// * |
// * |            expression = createNode( "named", {
// * |                name: displayName,
// * |                expression: expression,
// * |            } );
// * |
// * |        return createNode( "rule", { name, expression } );
// * |
// * |    }

const $Rule = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $Identifier)
            , "name")
            .and(r => r
                .ref(() => $__)
            )
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $StringLiteral)
                        )
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                    )
                )
            , "displayName")
            .and(r => r
                .seqEqual("=")
            )
            .and(r => r
                .ref(() => $__)
            )
            .and(r => r
                .ref(() => $Expression)
            , "expression")
            .and(r => r
                .ref(() => $EOS)
            )
        )
    , (({ createNode, name, displayName, expression }) => {
        const newExpression = displayName ? createNode( "named", {
            name: displayName,
            expression: expression,
        } ) as pegType.ast.Named : expression;

        return createNode( "rule", { name, expression: newExpression } ) as pegType.ast.Rule;
    })
    )
    ;

// * |Expression
// * |  = ChoiceExpression

const $Expression: ValueRule<pegType.ast.Expression> = factory
    .ref(() => $ChoiceExpression)
    ;

// * |ChoiceExpression
// * |  = head:ActionExpression tail:(__ "/" __ @ActionExpression)* {
// * |
// * |        if ( tail.length === 0 ) return head;
// * |
// * |        return createNode( "choice", {
// * |            alternatives: [ head ].concat( tail ),
// * |        } );
// * |
// * |    }

const $ChoiceExpression = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $ActionExpression)
            , "head")
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(c => c
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                        .andOmit(r => r
                            .seqEqual("/")
                        )
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                        .and(r => r
                            .ref(() => $ActionExpression)
                        )
                    )
                )
            , "tail")
        )
    , (({ createNode, head, tail }) => {
        if ( tail.length === 0 ) return head;

        return createNode( "choice", {
            alternatives: [ head ].concat( tail ),
        } ) as pegType.ast.ChoiceExpression;
    })
    )
    ;

// * |ActionExpression
// * |  = expression:SequenceExpression code:(__ @CodeBlock)? {
// * |
// * |        if ( code === null ) return expression;
// * |
// * |        return createNode( "action", { expression, code } );
// * |
// * |    }

const $ActionExpression = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $SequenceExpression)
            , "expression")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                        .and(r => r
                            .ref(() => $CodeBlock)
                        )
                    )
                )
            , "code")
        )
    , (({ createNode, expression, code }) => {
        if ( code === null ) return expression;

        return createNode( "action", { expression, code } ) as pegType.ast.ActionExpression;
    })
    )
    ;

// * |SequenceExpression
// * |  = head:LabeledExpression tail:(__ @LabeledExpression)* {
// * |
// * |        let elements = [ head ];
// * |
// * |        if ( tail.length === 0 ) {
// * |
// * |            if ( head.type !== "labeled" || ! head.pick ) return head;
// * |
// * |        } else {
// * |
// * |            elements = elements.concat( tail );
// * |
// * |        }
// * |
// * |        return createNode( "sequence", { elements } );
// * |
// * |    }

const $SequenceExpression = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $LabeledExpression)
            , "head")
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(c => c
                        .andOmit(r => r
                            .ref(() => $__)
                        )
                        .and(r => r
                            .ref(() => $LabeledExpression)
                        )
                    )
                )
            , "tail")
        )
    , (({ createNode, head, tail }) => {
        let elements = [ head ];

        if ( tail.length === 0 ) {

            if ( head.type !== "labeled" || !head.pick ) return head;

        } else {

            elements = elements.concat( tail );

        }

        return createNode( "sequence", { elements } ) as pegType.ast.SequenceExpression;
    })
    )
    ;

// * |LabeledExpression
// * |  = "@" label:LabelIdentifier? __ expression:PrefixedExpression {
// * |
// * |        return createNode( "labeled", { pick, label, expression } );
// * |
// * |    }
// * |  / label:LabelIdentifier __ expression:PrefixedExpression {
// * |
// * |        return createNode( "labeled", { label, expression } );
// * |
// * |    }
// * |  / PrefixedExpression

const $LabeledExpression = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("@")
                    )
                    .and(r => r
                        .zeroOrOne(r => r
                            .ref(() => $LabelIdentifier)
                        )
                    , "label")
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .ref(() => $PrefixedExpression)
                    , "expression")
                )
            , (({ pick, createNode, label, expression }) => {
                return createNode( "labeled", { pick, label, expression } ) as pegType.ast.LabeledExpression;
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .ref(() => $LabelIdentifier)
                    , "label")
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .ref(() => $PrefixedExpression)
                    , "expression")
                )
            , (({ createNode, label, expression }) => {
                return createNode( "labeled", { label, expression } ) as pegType.ast.LabeledExpression;
            })
            )
        )
        .or(r => r
            .ref(() => $PrefixedExpression)
        )
    )
    ;

// * |LabelIdentifier
// * |  = name:Identifier __ ":" {
// * |
// * |        if ( RESERVED_WORDS[ name ] !== true ) return name;
// * |
// * |        error( `Label can't be a reserved word "${ name }".` );
// * |
// * |    }

const $LabelIdentifier = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $Identifier)
            , "name")
            .and(r => r
                .ref(() => $__)
            )
            .and(r => r
                .seqEqual(":")
            )
        )
    , (({ RESERVED_WORDS, error, location, name }) => {
        if ( RESERVED_WORDS[ name ] !== true ) return name;

        throw error( `Label can't be a reserved word "${ name }".`, location() );
    })
    )
    ;

// * |PrefixedExpression
// * |  = operator:PrefixedOperator __ expression:SuffixedExpression {
// * |
// * |        return createNode( operator, { expression } );
// * |
// * |    }
// * |  / SuffixedExpression

const $PrefixedExpression = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .ref(() => $PrefixedOperator)
                    , "operator")
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .ref(() => $SuffixedExpression)
                    , "expression")
                )
            , (({ createNode, operator, expression }) => {
                return createNode( operator, { expression } ) as pegType.ast.PrefixedExpression;
            })
            )
        )
        .or(r => r
            .ref(() => $SuffixedExpression)
        )
    )
    ;

// * |PrefixedOperator
// * |  = "$" { return "text"; }
// * |  / "&" { return "simple_and"; }
// * |  / "!" { return "simple_not"; }

const $PrefixedOperator = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .seqEqual("$")
            , (() => {
                return "text";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("&")
            , (() => {
                return "simple_and";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("!")
            , (() => {
                return "simple_not";
            })
            )
        )
    )
    ;

// * |SuffixedExpression
// * |  = expression:PrimaryExpression __ operator:SuffixedOperator {
// * |
// * |        return createNode( operator, { expression } );
// * |
// * |    }
// * |  / PrimaryExpression

const $SuffixedExpression = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .ref(() => $PrimaryExpression)
                    , "expression")
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .ref(() => $SuffixedOperator)
                    , "operator")
                )
            , (({ createNode, expression, operator }) => {
                return createNode( operator, { expression } ) as pegType.ast.SuffixedExpression;
            })
            )
        )
        .or(r => r
            .ref(() => $PrimaryExpression)
        )
    )
    ;

// * |SuffixedOperator
// * |  = "?" { return "optional"; }
// * |  / "*" { return "zero_or_more"; }
// * |  / "+" { return "one_or_more"; }

const $SuffixedOperator = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .seqEqual("?")
            , (() => {
                return "optional";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("*")
            , (() => {
                return "zero_or_more";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("+")
            , (() => {
                return "one_or_more";
            })
            )
        )
    )
    ;

// * |PrimaryExpression
// * |  = LiteralMatcher
// * |  / CharacterClassMatcher
// * |  / AnyMatcher
// * |  / RuleReferenceExpression
// * |  / SemanticPredicateExpression
// * |  / "(" __ e:Expression __ ")" {
// * |
// * |        // The purpose of the "group" AST node is just to isolate label scope. We
// * |        // don't need to put it around nodes that can't contain any labels or
// * |        // nodes that already isolate label scope themselves.
// * |        if ( e.type !== "labeled" && e.type !== "sequence" ) return e;
// * |
// * |        // This leaves us with "labeled" and "sequence".
// * |        return createNode( "group", { expression: e } );
// * |
// * |    }

const $PrimaryExpression = factory
    .choice(c => c
        .or(r => r
            .ref(() => $LiteralMatcher)
        )
        .or(r => r
            .ref(() => $CharacterClassMatcher)
        )
        .or(r => r
            .ref(() => $AnyMatcher)
        )
        .or(r => r
            .ref(() => $RuleReferenceExpression)
        )
        .or(r => r
            .ref(() => $SemanticPredicateExpression)
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("(")
                    )
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .ref(() => $Expression)
                    , "e")
                    .and(r => r
                        .ref(() => $__)
                    )
                    .and(r => r
                        .seqEqual(")")
                    )
                )
            , (({ createNode, e }) => {
                // The purpose of the "group" AST node is just to isolate label scope. We
                // don't need to put it around nodes that can't contain any labels or
                // nodes that already isolate label scope themselves.
                if ( e.type !== "labeled" && e.type !== "sequence" ) return e;

                // This leaves us with "labeled" and "sequence".
                return createNode( "group", { expression: e } ) as pegType.ast.GroupExpression;
            })
            )
        )
    )
    ;

// * |RuleReferenceExpression
// * |  = name:Identifier !(__ (StringLiteral __)? "=") {
// * |
// * |        return createNode( "rule_ref", { name } );
// * |
// * |    }

const $RuleReferenceExpression = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $Identifier)
            , "name")
            .and(r => r
                .nextIsNot(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $__)
                        )
                        .and(r => r
                            .zeroOrOne(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $StringLiteral)
                                    )
                                    .and(r => r
                                        .ref(() => $__)
                                    )
                                )
                            )
                        )
                        .and(r => r
                            .seqEqual("=")
                        )
                    )
                )
            )
        )
    , (({ createNode, name }) => {
        return createNode( "rule_ref", { name } ) as pegType.ast.RuleReferenceExpression;
    })
    )
    ;

// * |SemanticPredicateExpression
// * |  = operator:SemanticPredicateOperator __ code:CodeBlock {
// * |
// * |        return createNode( operator, { code } );
// * |
// * |    }

const $SemanticPredicateExpression = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $SemanticPredicateOperator)
            , "operator")
            .and(r => r
                .ref(() => $__)
            )
            .and(r => r
                .ref(() => $CodeBlock)
            , "code")
        )
    , (({ createNode, operator, code }) => {
        return createNode( operator, { code } ) as pegType.ast.SemanticPredicateExpression;
    })
    )
    ;

// * |SemanticPredicateOperator
// * |  = "&" { return "semantic_and"; }
// * |  / "!" { return "semantic_not"; }

const $SemanticPredicateOperator = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .seqEqual("&")
            , (() => {
                return "semantic_and";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("!")
            , (() => {
                return "semantic_not";
            })
            )
        )
    )
    ;

// * |// ---- Lexical Grammar -----

// * |SourceCharacter
// * |  = .

const $SourceCharacter = factory
    .anyOne()
    ;

// * |WhiteSpace "whitespace"
// * |  = "\t"
// * |  / "\v"
// * |  / "\f"
// * |  / " "
// * |  / "\u00A0"
// * |  / "\uFEFF"
// * |  / Zs

const $WhiteSpace = factory
    .withName("whitespace")
    .choice(c => c
        .or(r => r
            .seqEqual("\t")
        )
        .or(r => r
            .seqEqual("\u000b")
        )
        .or(r => r
            .seqEqual("\f")
        )
        .or(r => r
            .seqEqual(" ")
        )
        .or(r => r
            .seqEqual("\u00a0")
        )
        .or(r => r
            .seqEqual("\ufeff")
        )
        .or(r => r
            .ref(() => $Zs)
        )
    )
    ;

// * |LineTerminator
// * |  = [\n\r\u2028\u2029]

const $LineTerminator = factory
    .regExp(/^[\n\r\u2028\u2029]/)
    ;

// * |LineTerminatorSequence "end of line"
// * |  = "\n"
// * |  / "\r\n"
// * |  / "\r"
// * |  / "\u2028"
// * |  / "\u2029"

const $LineTerminatorSequence = factory
    .withName("end of line")
    .choice(c => c
        .or(r => r
            .seqEqual("\n")
        )
        .or(r => r
            .seqEqual("\r\n")
        )
        .or(r => r
            .seqEqual("\r")
        )
        .or(r => r
            .seqEqual("\u2028")
        )
        .or(r => r
            .seqEqual("\u2029")
        )
    )
    ;

// * |Comment "comment"
// * |  = MultiLineComment
// * |  / SingleLineComment

const $Comment = factory
    .withName("comment")
    .choice(c => c
        .or(r => r
            .ref(() => $MultiLineComment)
        )
        .or(r => r
            .ref(() => $SingleLineComment)
        )
    )
    ;

// * |MultiLineComment
// * |  = "/*" comment:$(!"*/" SourceCharacter)* "*/" {
// * |
// * |        return addComment( comment, true );
// * |
// * |  }

const $MultiLineComment = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("/*")
            )
            .and(r => r
                .asSlice(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .nextIsNot(r => r
                                    .seqEqual("*/")
                                )
                            )
                            .and(r => r
                                .ref(() => $SourceCharacter)
                            )
                        )
                    )
                )
            , "comment")
            .and(r => r
                .seqEqual("*/")
            )
        )
    , (({ addComment, comment }) => {
        return addComment( comment, true );
    })
    )
    ;

// * |MultiLineCommentNoLineTerminator
// * |  = "/*" comment:$(!("*/" / LineTerminator) SourceCharacter)* "*/" {
// * |
// * |        return addComment( comment, true );
// * |
// * |  }

const $MultiLineCommentNoLineTerminator = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("/*")
            )
            .and(r => r
                .asSlice(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .nextIsNot(r => r
                                    .choice(c => c
                                        .or(r => r
                                            .seqEqual("*/")
                                        )
                                        .or(r => r
                                            .ref(() => $LineTerminator)
                                        )
                                    )
                                )
                            )
                            .and(r => r
                                .ref(() => $SourceCharacter)
                            )
                        )
                    )
                )
            , "comment")
            .and(r => r
                .seqEqual("*/")
            )
        )
    , (({ addComment, comment }) => {
        return addComment( comment, true );
    })
    )
    ;

// * |SingleLineComment
// * |  = "//" comment:$(!LineTerminator SourceCharacter)* {
// * |
// * |        return addComment( comment, false );
// * |
// * |  }

const $SingleLineComment = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("//")
            )
            .and(r => r
                .asSlice(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .nextIsNot(r => r
                                    .ref(() => $LineTerminator)
                                )
                            )
                            .and(r => r
                                .ref(() => $SourceCharacter)
                            )
                        )
                    )
                )
            , "comment")
        )
    , (({ addComment, comment }) => {
        return addComment( comment, false );
    })
    )
    ;

// * |Identifier "identifier"
// * |  = head:IdentifierStart tail:IdentifierPart* {
// * |
// * |        return head + tail.join("");
// * |
// * |    }

const $Identifier = factory
    .withName("identifier")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $IdentifierStart)
            , "head")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $IdentifierPart)
                )
            , "tail")
        )
    , (({ head, tail }) => {
        return head + tail.join("");
    })
    )
    ;

// * |IdentifierStart
// * |  = UnicodeLetter
// * |  / "$"
// * |  / "_"
// * |  / "\\" @UnicodeEscapeSequence

const $IdentifierStart = factory
    .choice(c => c
        .or(r => r
            .ref(() => $UnicodeLetter)
        )
        .or(r => r
            .seqEqual("$")
        )
        .or(r => r
            .seqEqual("_")
        )
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .seqEqual("\\")
                )
                .and(r => r
                    .ref(() => $UnicodeEscapeSequence)
                )
            )
        )
    )
    ;

// * |IdentifierPart
// * |  = IdentifierStart
// * |  / UnicodeCombiningMark
// * |  / UnicodeDigit
// * |  / UnicodeConnectorPunctuation
// * |  / "\u200C"
// * |  / "\u200D"

const $IdentifierPart = factory
    .choice(c => c
        .or(r => r
            .ref(() => $IdentifierStart)
        )
        .or(r => r
            .ref(() => $UnicodeCombiningMark)
        )
        .or(r => r
            .ref(() => $UnicodeDigit)
        )
        .or(r => r
            .ref(() => $UnicodeConnectorPunctuation)
        )
        .or(r => r
            .seqEqual("\u200c")
        )
        .or(r => r
            .seqEqual("\u200d")
        )
    )
    ;

// * |UnicodeLetter
// * |  = Lu
// * |  / Ll
// * |  / Lt
// * |  / Lm
// * |  / Lo
// * |  / Nl

const $UnicodeLetter = factory
    .choice(c => c
        .or(r => r
            .ref(() => $Lu)
        )
        .or(r => r
            .ref(() => $Ll)
        )
        .or(r => r
            .ref(() => $Lt)
        )
        .or(r => r
            .ref(() => $Lm)
        )
        .or(r => r
            .ref(() => $Lo)
        )
        .or(r => r
            .ref(() => $Nl)
        )
    )
    ;

// * |UnicodeCombiningMark
// * |  = Mn
// * |  / Mc

const $UnicodeCombiningMark = factory
    .choice(c => c
        .or(r => r
            .ref(() => $Mn)
        )
        .or(r => r
            .ref(() => $Mc)
        )
    )
    ;

// * |UnicodeDigit
// * |  = Nd

const $UnicodeDigit = factory
    .ref(() => $Nd)
    ;

// * |UnicodeConnectorPunctuation
// * |  = Pc

const $UnicodeConnectorPunctuation = factory
    .ref(() => $Pc)
    ;

// * |LiteralMatcher "literal"
// * |  = value:StringLiteral ignoreCase:"i"? {
// * |
// * |        return createNode( "literal", {
// * |            value: value,
// * |            ignoreCase: ignoreCase !== null,
// * |        } );
// * |
// * |    }

const $LiteralMatcher = factory
    .withName("literal")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $StringLiteral)
            , "value")
            .and(r => r
                .zeroOrOne(r => r
                    .seqEqual("i")
                )
            , "ignoreCase")
        )
    , (({ createNode, value, ignoreCase }) => {
        return createNode( "literal", {
            value: value,
            ignoreCase: ignoreCase !== null,
        } ) as pegType.ast.LiteralMatcher;
    })
    )
    ;

// * |StringLiteral "string"
// * |  = '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }
// * |  / "'" chars:SingleStringCharacter* "'" { return chars.join(""); }

const $StringLiteral = factory
    .withName("string")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("\"")
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .ref(() => $DoubleStringCharacter)
                        )
                    , "chars")
                    .and(r => r
                        .seqEqual("\"")
                    )
                )
            , (({ chars }) => {
                return chars.join("");
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("'")
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .ref(() => $SingleStringCharacter)
                        )
                    , "chars")
                    .and(r => r
                        .seqEqual("'")
                    )
                )
            , (({ chars }) => {
                return chars.join("");
            })
            )
        )
    )
    ;

// * |DoubleStringCharacter
// * |  = !('"' / "\\" / LineTerminator) @SourceCharacter
// * |  / "\\" @EscapeSequence
// * |  / LineContinuation

const $DoubleStringCharacter = factory
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .nextIsNot(r => r
                        .choice(c => c
                            .or(r => r
                                .seqEqual("\"")
                            )
                            .or(r => r
                                .seqEqual("\\")
                            )
                            .or(r => r
                                .ref(() => $LineTerminator)
                            )
                        )
                    )
                )
                .and(r => r
                    .ref(() => $SourceCharacter)
                )
            )
        )
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .seqEqual("\\")
                )
                .and(r => r
                    .ref(() => $EscapeSequence)
                )
            )
        )
        .or(r => r
            .ref(() => $LineContinuation)
        )
    )
    ;

// * |SingleStringCharacter
// * |  = !("'" / "\\" / LineTerminator) @SourceCharacter
// * |  / "\\" @EscapeSequence
// * |  / LineContinuation

const $SingleStringCharacter = factory
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .nextIsNot(r => r
                        .choice(c => c
                            .or(r => r
                                .seqEqual("'")
                            )
                            .or(r => r
                                .seqEqual("\\")
                            )
                            .or(r => r
                                .ref(() => $LineTerminator)
                            )
                        )
                    )
                )
                .and(r => r
                    .ref(() => $SourceCharacter)
                )
            )
        )
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .seqEqual("\\")
                )
                .and(r => r
                    .ref(() => $EscapeSequence)
                )
            )
        )
        .or(r => r
            .ref(() => $LineContinuation)
        )
    )
    ;

// * |CharacterClassMatcher "character class"
// * |  = "[" inverted:"^"? parts:CharacterPart* "]" ignoreCase:"i"? {
// * |
// * |        return createNode( "class", {
// * |            parts: parts.filter( part => part !== "" ),
// * |            inverted: inverted !== null,
// * |            ignoreCase: ignoreCase !== null,
// * |        } );
// * |
// * |    }

const $CharacterClassMatcher = factory
    .withName("character class")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("[")
            )
            .and(r => r
                .zeroOrOne(r => r
                    .seqEqual("^")
                )
            , "inverted")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $CharacterPart)
                )
            , "parts")
            .and(r => r
                .seqEqual("]")
            )
            .and(r => r
                .zeroOrOne(r => r
                    .seqEqual("i")
                )
            , "ignoreCase")
        )
    , (({ createNode, inverted, parts, ignoreCase }) => {
        return createNode( "class", {
            parts: parts.filter( part => part !== "" ),
            inverted: inverted !== null,
            ignoreCase: ignoreCase !== null,
        } ) as pegType.ast.CharacterClassMatcher;
    })
    )
    ;

// * |CharacterPart
// * |  = ClassCharacterRange
// * |  / ClassCharacter

const $CharacterPart = factory
    .choice(c => c
        .or(r => r
            .ref(() => $ClassCharacterRange)
        )
        .or(r => r
            .ref(() => $ClassCharacter)
        )
    )
    ;

// * |ClassCharacterRange
// * |  = begin:ClassCharacter "-" end:ClassCharacter {
// * |
// * |        if ( begin.charCodeAt( 0 ) > end.charCodeAt( 0 ) )
// * |
// * |            error( "Invalid character range: " + text() + "." );
// * |
// * |        return [ begin, end ];
// * |
// * |    }

const $ClassCharacterRange = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $ClassCharacter)
            , "begin")
            .and(r => r
                .seqEqual("-")
            )
            .and(r => r
                .ref(() => $ClassCharacter)
            , "end")
        )
    , (({ error, text, begin, end }) => {
        if ( begin.charCodeAt( 0 ) > end.charCodeAt( 0 ) ) error( "Invalid character range: " + text() + "." );

        return [ begin, end ];
    })
    )
    ;

// * |ClassCharacter
// * |  = !("]" / "\\" / LineTerminator) @SourceCharacter
// * |  / "\\" @EscapeSequence
// * |  / LineContinuation

const $ClassCharacter = factory
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .nextIsNot(r => r
                        .choice(c => c
                            .or(r => r
                                .seqEqual("]")
                            )
                            .or(r => r
                                .seqEqual("\\")
                            )
                            .or(r => r
                                .ref(() => $LineTerminator)
                            )
                        )
                    )
                )
                .and(r => r
                    .ref(() => $SourceCharacter)
                )
            )
        )
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .seqEqual("\\")
                )
                .and(r => r
                    .ref(() => $EscapeSequence)
                )
            )
        )
        .or(r => r
            .ref(() => $LineContinuation)
        )
    )
    ;

// * |LineContinuation
// * |  = "\\" LineTerminatorSequence { return ""; }

const $LineContinuation = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("\\")
            )
            .and(r => r
                .ref(() => $LineTerminatorSequence)
            )
        )
    , (() => {
        return "";
    })
    )
    ;

// * |EscapeSequence
// * |  = CharacterEscapeSequence
// * |  / "0" !DecimalDigit { return "\0"; }
// * |  / HexEscapeSequence
// * |  / UnicodeEscapeSequence

const $EscapeSequence = factory
    .choice(c => c
        .or(r => r
            .ref(() => $CharacterEscapeSequence)
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("0")
                    )
                    .and(r => r
                        .nextIsNot(r => r
                            .ref(() => $DecimalDigit)
                        )
                    )
                )
            , (() => {
                return "\0";
            })
            )
        )
        .or(r => r
            .ref(() => $HexEscapeSequence)
        )
        .or(r => r
            .ref(() => $UnicodeEscapeSequence)
        )
    )
    ;

// * |CharacterEscapeSequence
// * |  = SingleEscapeCharacter
// * |  / NonEscapeCharacter

const $CharacterEscapeSequence = factory
    .choice(c => c
        .or(r => r
            .ref(() => $SingleEscapeCharacter)
        )
        .or(r => r
            .ref(() => $NonEscapeCharacter)
        )
    )
    ;

// * |SingleEscapeCharacter
// * |  = "'"
// * |  / '"'
// * |  / "\\"
// * |  / "b"  { return "\b"; }
// * |  / "f"  { return "\f"; }
// * |  / "n"  { return "\n"; }
// * |  / "r"  { return "\r"; }
// * |  / "t"  { return "\t"; }
// * |  / "v"  { return "\v"; }

const $SingleEscapeCharacter = factory
    .choice(c => c
        .or(r => r
            .seqEqual("'")
        )
        .or(r => r
            .seqEqual("\"")
        )
        .or(r => r
            .seqEqual("\\")
        )
        .or(r => r
            .action(r => r
                .seqEqual("b")
            , (() => {
                return "\b";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("f")
            , (() => {
                return "\f";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("n")
            , (() => {
                return "\n";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("r")
            , (() => {
                return "\r";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("t")
            , (() => {
                return "\t";
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("v")
            , (() => {
                return "\v";
            })
            )
        )
    )
    ;

// * |NonEscapeCharacter
// * |  = !(EscapeCharacter / LineTerminator) @SourceCharacter

const $NonEscapeCharacter = factory
    .sequence(c => c
        .andOmit(r => r
            .nextIsNot(r => r
                .choice(c => c
                    .or(r => r
                        .ref(() => $EscapeCharacter)
                    )
                    .or(r => r
                        .ref(() => $LineTerminator)
                    )
                )
            )
        )
        .and(r => r
            .ref(() => $SourceCharacter)
        )
    )
    ;

// * |EscapeCharacter
// * |  = SingleEscapeCharacter
// * |  / DecimalDigit
// * |  / "x"
// * |  / "u"

const $EscapeCharacter = factory
    .choice(c => c
        .or(r => r
            .ref(() => $SingleEscapeCharacter)
        )
        .or(r => r
            .ref(() => $DecimalDigit)
        )
        .or(r => r
            .seqEqual("x")
        )
        .or(r => r
            .seqEqual("u")
        )
    )
    ;

// * |HexEscapeSequence
// * |  = "x" digits:$(HexDigit HexDigit) {
// * |
// * |        return String.fromCharCode( parseInt( digits, 16 ) );
// * |
// * |    }

const $HexEscapeSequence = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("x")
            )
            .and(r => r
                .asSlice(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                    )
                )
            , "digits")
        )
    , (({ digits }) => {
        return String.fromCharCode( parseInt( digits, 16 ) );
    })
    )
    ;

// * |UnicodeEscapeSequence
// * |  = "u" digits:$(HexDigit HexDigit HexDigit HexDigit) {
// * |
// * |        return String.fromCharCode( parseInt( digits, 16 ) );
// * |
// * |    }

const $UnicodeEscapeSequence = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("u")
            )
            .and(r => r
                .asSlice(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                        .and(r => r
                            .ref(() => $HexDigit)
                        )
                    )
                )
            , "digits")
        )
    , (({ digits }) => {
        return String.fromCharCode( parseInt( digits, 16 ) );
    })
    )
    ;

// * |DecimalDigit
// * |  = [0-9]

const $DecimalDigit = factory
    .regExp(/^[0-9]/)
    ;

// * |HexDigit
// * |  = [0-9a-f]i

const $HexDigit = factory
    .regExp(/^[0-9a-f]/i)
    ;

// * |AnyMatcher
// * |  = "." {
// * |
// * |        return createNode( "any" );
// * |
// * |    }

const $AnyMatcher = factory
    .action(r => r
        .seqEqual(".")
    , (({ createNode }) => {
        return createNode( "any" ) as pegType.ast.AnyMatcher;
    })
    )
    ;

// * |CodeBlock "code block"
// * |  = "{" @Code "}"
// * |  / "{" { error("Unbalanced brace."); }

const $CodeBlock = factory
    .withName("code block")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .andOmit(r => r
                    .seqEqual("{")
                )
                .and(r => r
                    .ref(() => $Code)
                )
                .andOmit(r => r
                    .seqEqual("}")
                )
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("{")
            , (({ error }) => {
                throw error("Unbalanced brace.");
            })
            )
        )
    )
    ;

// * |Code
// * |  = $((![{}] SourceCharacter)+ / "{" Code "}")*

const $Code: ValueRule<string> = factory
    .asSlice(r => r
        .zeroOrMore(r => r
            .choice(c => c
                .or(r => r
                    .oneOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .nextIsNot(r => r
                                    .regExp(/^[{}]/)
                                )
                            )
                            .and(r => r
                                .ref(() => $SourceCharacter)
                            )
                        )
                    )
                )
                .or(r => r
                    .sequence(c => c
                        .and(r => r
                            .seqEqual("{")
                        )
                        .and(r => r
                            .ref(() => $Code)
                        )
                        .and(r => r
                            .seqEqual("}")
                        )
                    )
                )
            )
        )
    )
    ;

// * |// Unicode Character Categories
// * |//
// * |// Extracted from the following Unicode Character Database file:
// * |//
// * |//   http://www.unicode.org/Public/11.0.0/ucd/extracted/DerivedGeneralCategory.txt
// * |//
// * |// Unix magic used:
// * |//
// * |//   grep "; $CATEGORY" DerivedGeneralCategory.txt |   # Filter characters
// * |//     cut -f1 -d " " |                                # Extract code points
// * |//     grep -v '[0-9a-fA-F]\{5\}' |                    # Exclude non-BMP characters
// * |//     sed -e 's/\.\./-/' |                            # Adjust formatting
// * |//     sed -e 's/\([0-9a-fA-F]\{4\}\)/\\u\1/g' |       # Adjust formatting
// * |//     tr -d '\n'                                      # Join lines
// * |//
// * |// ECMA-262 allows using Unicode 3.0 or later, version 8.0.0 was the latest one
// * |// at the time of writing.
// * |//
// * |// Non-BMP characters are completely ignored to avoid surrogate pair handling
// * |// (detecting surrogate pairs isn't possible with a simple character class and
// * |// other methods would degrade performance). I don't consider it a big deal as
// * |// even parsers in JavaScript engines of common browsers seem to ignore them.

// * |// Letter, Lowercase
// * |Ll = [\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]

const $Ll = factory
    .regExp(/^[a-z\u00b5\u00df-\u00f6\u00f8-\u00ff\u0101\u0103\u0105\u0107\u0109\u010b\u010d\u010f\u0111\u0113\u0115\u0117\u0119\u011b\u011d\u011f\u0121\u0123\u0125\u0127\u0129\u012b\u012d\u012f\u0131\u0133\u0135\u0137-\u0138\u013a\u013c\u013e\u0140\u0142\u0144\u0146\u0148-\u0149\u014b\u014d\u014f\u0151\u0153\u0155\u0157\u0159\u015b\u015d\u015f\u0161\u0163\u0165\u0167\u0169\u016b\u016d\u016f\u0171\u0173\u0175\u0177\u017a\u017c\u017e-\u0180\u0183\u0185\u0188\u018c-\u018d\u0192\u0195\u0199-\u019b\u019e\u01a1\u01a3\u01a5\u01a8\u01aa-\u01ab\u01ad\u01b0\u01b4\u01b6\u01b9-\u01ba\u01bd-\u01bf\u01c6\u01c9\u01cc\u01ce\u01d0\u01d2\u01d4\u01d6\u01d8\u01da\u01dc-\u01dd\u01df\u01e1\u01e3\u01e5\u01e7\u01e9\u01eb\u01ed\u01ef-\u01f0\u01f3\u01f5\u01f9\u01fb\u01fd\u01ff\u0201\u0203\u0205\u0207\u0209\u020b\u020d\u020f\u0211\u0213\u0215\u0217\u0219\u021b\u021d\u021f\u0221\u0223\u0225\u0227\u0229\u022b\u022d\u022f\u0231\u0233-\u0239\u023c\u023f-\u0240\u0242\u0247\u0249\u024b\u024d\u024f-\u0293\u0295-\u02af\u0371\u0373\u0377\u037b-\u037d\u0390\u03ac-\u03ce\u03d0-\u03d1\u03d5-\u03d7\u03d9\u03db\u03dd\u03df\u03e1\u03e3\u03e5\u03e7\u03e9\u03eb\u03ed\u03ef-\u03f3\u03f5\u03f8\u03fb-\u03fc\u0430-\u045f\u0461\u0463\u0465\u0467\u0469\u046b\u046d\u046f\u0471\u0473\u0475\u0477\u0479\u047b\u047d\u047f\u0481\u048b\u048d\u048f\u0491\u0493\u0495\u0497\u0499\u049b\u049d\u049f\u04a1\u04a3\u04a5\u04a7\u04a9\u04ab\u04ad\u04af\u04b1\u04b3\u04b5\u04b7\u04b9\u04bb\u04bd\u04bf\u04c2\u04c4\u04c6\u04c8\u04ca\u04cc\u04ce-\u04cf\u04d1\u04d3\u04d5\u04d7\u04d9\u04db\u04dd\u04df\u04e1\u04e3\u04e5\u04e7\u04e9\u04eb\u04ed\u04ef\u04f1\u04f3\u04f5\u04f7\u04f9\u04fb\u04fd\u04ff\u0501\u0503\u0505\u0507\u0509\u050b\u050d\u050f\u0511\u0513\u0515\u0517\u0519\u051b\u051d\u051f\u0521\u0523\u0525\u0527\u0529\u052b\u052d\u052f\u0560-\u0588\u10d0-\u10fa\u10fd-\u10ff\u13f8-\u13fd\u1c80-\u1c88\u1d00-\u1d2b\u1d6b-\u1d77\u1d79-\u1d9a\u1e01\u1e03\u1e05\u1e07\u1e09\u1e0b\u1e0d\u1e0f\u1e11\u1e13\u1e15\u1e17\u1e19\u1e1b\u1e1d\u1e1f\u1e21\u1e23\u1e25\u1e27\u1e29\u1e2b\u1e2d\u1e2f\u1e31\u1e33\u1e35\u1e37\u1e39\u1e3b\u1e3d\u1e3f\u1e41\u1e43\u1e45\u1e47\u1e49\u1e4b\u1e4d\u1e4f\u1e51\u1e53\u1e55\u1e57\u1e59\u1e5b\u1e5d\u1e5f\u1e61\u1e63\u1e65\u1e67\u1e69\u1e6b\u1e6d\u1e6f\u1e71\u1e73\u1e75\u1e77\u1e79\u1e7b\u1e7d\u1e7f\u1e81\u1e83\u1e85\u1e87\u1e89\u1e8b\u1e8d\u1e8f\u1e91\u1e93\u1e95-\u1e9d\u1e9f\u1ea1\u1ea3\u1ea5\u1ea7\u1ea9\u1eab\u1ead\u1eaf\u1eb1\u1eb3\u1eb5\u1eb7\u1eb9\u1ebb\u1ebd\u1ebf\u1ec1\u1ec3\u1ec5\u1ec7\u1ec9\u1ecb\u1ecd\u1ecf\u1ed1\u1ed3\u1ed5\u1ed7\u1ed9\u1edb\u1edd\u1edf\u1ee1\u1ee3\u1ee5\u1ee7\u1ee9\u1eeb\u1eed\u1eef\u1ef1\u1ef3\u1ef5\u1ef7\u1ef9\u1efb\u1efd\u1eff-\u1f07\u1f10-\u1f15\u1f20-\u1f27\u1f30-\u1f37\u1f40-\u1f45\u1f50-\u1f57\u1f60-\u1f67\u1f70-\u1f7d\u1f80-\u1f87\u1f90-\u1f97\u1fa0-\u1fa7\u1fb0-\u1fb4\u1fb6-\u1fb7\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fc7\u1fd0-\u1fd3\u1fd6-\u1fd7\u1fe0-\u1fe7\u1ff2-\u1ff4\u1ff6-\u1ff7\u210a\u210e-\u210f\u2113\u212f\u2134\u2139\u213c-\u213d\u2146-\u2149\u214e\u2184\u2c30-\u2c5e\u2c61\u2c65-\u2c66\u2c68\u2c6a\u2c6c\u2c71\u2c73-\u2c74\u2c76-\u2c7b\u2c81\u2c83\u2c85\u2c87\u2c89\u2c8b\u2c8d\u2c8f\u2c91\u2c93\u2c95\u2c97\u2c99\u2c9b\u2c9d\u2c9f\u2ca1\u2ca3\u2ca5\u2ca7\u2ca9\u2cab\u2cad\u2caf\u2cb1\u2cb3\u2cb5\u2cb7\u2cb9\u2cbb\u2cbd\u2cbf\u2cc1\u2cc3\u2cc5\u2cc7\u2cc9\u2ccb\u2ccd\u2ccf\u2cd1\u2cd3\u2cd5\u2cd7\u2cd9\u2cdb\u2cdd\u2cdf\u2ce1\u2ce3-\u2ce4\u2cec\u2cee\u2cf3\u2d00-\u2d25\u2d27\u2d2d\ua641\ua643\ua645\ua647\ua649\ua64b\ua64d\ua64f\ua651\ua653\ua655\ua657\ua659\ua65b\ua65d\ua65f\ua661\ua663\ua665\ua667\ua669\ua66b\ua66d\ua681\ua683\ua685\ua687\ua689\ua68b\ua68d\ua68f\ua691\ua693\ua695\ua697\ua699\ua69b\ua723\ua725\ua727\ua729\ua72b\ua72d\ua72f-\ua731\ua733\ua735\ua737\ua739\ua73b\ua73d\ua73f\ua741\ua743\ua745\ua747\ua749\ua74b\ua74d\ua74f\ua751\ua753\ua755\ua757\ua759\ua75b\ua75d\ua75f\ua761\ua763\ua765\ua767\ua769\ua76b\ua76d\ua76f\ua771-\ua778\ua77a\ua77c\ua77f\ua781\ua783\ua785\ua787\ua78c\ua78e\ua791\ua793-\ua795\ua797\ua799\ua79b\ua79d\ua79f\ua7a1\ua7a3\ua7a5\ua7a7\ua7a9\ua7af\ua7b5\ua7b7\ua7b9\ua7fa\uab30-\uab5a\uab60-\uab65\uab70-\uabbf\ufb00-\ufb06\ufb13-\ufb17\uff41-\uff5a]/)
    ;

// * |// Letter, Modifier
// * |Lm = [\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]

const $Lm = factory
    .regExp(/^[\u02b0-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0374\u037a\u0559\u0640\u06e5-\u06e6\u07f4-\u07f5\u07fa\u081a\u0824\u0828\u0971\u0e46\u0ec6\u10fc\u17d7\u1843\u1aa7\u1c78-\u1c7d\u1d2c-\u1d6a\u1d78\u1d9b-\u1dbf\u2071\u207f\u2090-\u209c\u2c7c-\u2c7d\u2d6f\u2e2f\u3005\u3031-\u3035\u303b\u309d-\u309e\u30fc-\u30fe\ua015\ua4f8-\ua4fd\ua60c\ua67f\ua69c-\ua69d\ua717-\ua71f\ua770\ua788\ua7f8-\ua7f9\ua9cf\ua9e6\uaa70\uaadd\uaaf3-\uaaf4\uab5c-\uab5f\uff70\uff9e-\uff9f]/)
    ;

// * |// Letter, Other
// * |Lo = [\u00AA\u00BA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05EF-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u09FC\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u1100-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]

const $Lo = factory
    .regExp(/^[\u00aa\u00ba\u01bb\u01c0-\u01c3\u0294\u05d0-\u05ea\u05ef-\u05f2\u0620-\u063f\u0641-\u064a\u066e-\u066f\u0671-\u06d3\u06d5\u06ee-\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u0800-\u0815\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09f0-\u09f1\u09fc\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0af9\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60-\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0cf1-\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e45\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u1100-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16f1-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17dc\u1820-\u1842\u1844-\u1878\u1880-\u1884\u1887-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae-\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c77\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5-\u1cf6\u2135-\u2138\u2d30-\u2d67\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3006\u303c\u3041-\u3096\u309f\u30a1-\u30fa\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fef\ua000-\ua014\ua016-\ua48c\ua4d0-\ua4f7\ua500-\ua60b\ua610-\ua61f\ua62a-\ua62b\ua66e\ua6a0-\ua6e5\ua78f\ua7f7\ua7fb-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd-\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9e0-\ua9e4\ua9e7-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa6f\uaa71-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5-\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadc\uaae0-\uaaea\uaaf2\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff66-\uff6f\uff71-\uff9d\uffa0-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/)
    ;

// * |// Letter, Titlecase
// * |Lt = [\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]

const $Lt = factory
    .regExp(/^[\u01c5\u01c8\u01cb\u01f2\u1f88-\u1f8f\u1f98-\u1f9f\u1fa8-\u1faf\u1fbc\u1fcc\u1ffc]/)
    ;

// * |// Letter, Uppercase
// * |Lu = [\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uFF21-\uFF3A]

const $Lu = factory
    .regExp(/^[A-Z\u00c0-\u00d6\u00d8-\u00de\u0100\u0102\u0104\u0106\u0108\u010a\u010c\u010e\u0110\u0112\u0114\u0116\u0118\u011a\u011c\u011e\u0120\u0122\u0124\u0126\u0128\u012a\u012c\u012e\u0130\u0132\u0134\u0136\u0139\u013b\u013d\u013f\u0141\u0143\u0145\u0147\u014a\u014c\u014e\u0150\u0152\u0154\u0156\u0158\u015a\u015c\u015e\u0160\u0162\u0164\u0166\u0168\u016a\u016c\u016e\u0170\u0172\u0174\u0176\u0178-\u0179\u017b\u017d\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018b\u018e-\u0191\u0193-\u0194\u0196-\u0198\u019c-\u019d\u019f-\u01a0\u01a2\u01a4\u01a6-\u01a7\u01a9\u01ac\u01ae-\u01af\u01b1-\u01b3\u01b5\u01b7-\u01b8\u01bc\u01c4\u01c7\u01ca\u01cd\u01cf\u01d1\u01d3\u01d5\u01d7\u01d9\u01db\u01de\u01e0\u01e2\u01e4\u01e6\u01e8\u01ea\u01ec\u01ee\u01f1\u01f4\u01f6-\u01f8\u01fa\u01fc\u01fe\u0200\u0202\u0204\u0206\u0208\u020a\u020c\u020e\u0210\u0212\u0214\u0216\u0218\u021a\u021c\u021e\u0220\u0222\u0224\u0226\u0228\u022a\u022c\u022e\u0230\u0232\u023a-\u023b\u023d-\u023e\u0241\u0243-\u0246\u0248\u024a\u024c\u024e\u0370\u0372\u0376\u037f\u0386\u0388-\u038a\u038c\u038e-\u038f\u0391-\u03a1\u03a3-\u03ab\u03cf\u03d2-\u03d4\u03d8\u03da\u03dc\u03de\u03e0\u03e2\u03e4\u03e6\u03e8\u03ea\u03ec\u03ee\u03f4\u03f7\u03f9-\u03fa\u03fd-\u042f\u0460\u0462\u0464\u0466\u0468\u046a\u046c\u046e\u0470\u0472\u0474\u0476\u0478\u047a\u047c\u047e\u0480\u048a\u048c\u048e\u0490\u0492\u0494\u0496\u0498\u049a\u049c\u049e\u04a0\u04a2\u04a4\u04a6\u04a8\u04aa\u04ac\u04ae\u04b0\u04b2\u04b4\u04b6\u04b8\u04ba\u04bc\u04be\u04c0-\u04c1\u04c3\u04c5\u04c7\u04c9\u04cb\u04cd\u04d0\u04d2\u04d4\u04d6\u04d8\u04da\u04dc\u04de\u04e0\u04e2\u04e4\u04e6\u04e8\u04ea\u04ec\u04ee\u04f0\u04f2\u04f4\u04f6\u04f8\u04fa\u04fc\u04fe\u0500\u0502\u0504\u0506\u0508\u050a\u050c\u050e\u0510\u0512\u0514\u0516\u0518\u051a\u051c\u051e\u0520\u0522\u0524\u0526\u0528\u052a\u052c\u052e\u0531-\u0556\u10a0-\u10c5\u10c7\u10cd\u13a0-\u13f5\u1c90-\u1cba\u1cbd-\u1cbf\u1e00\u1e02\u1e04\u1e06\u1e08\u1e0a\u1e0c\u1e0e\u1e10\u1e12\u1e14\u1e16\u1e18\u1e1a\u1e1c\u1e1e\u1e20\u1e22\u1e24\u1e26\u1e28\u1e2a\u1e2c\u1e2e\u1e30\u1e32\u1e34\u1e36\u1e38\u1e3a\u1e3c\u1e3e\u1e40\u1e42\u1e44\u1e46\u1e48\u1e4a\u1e4c\u1e4e\u1e50\u1e52\u1e54\u1e56\u1e58\u1e5a\u1e5c\u1e5e\u1e60\u1e62\u1e64\u1e66\u1e68\u1e6a\u1e6c\u1e6e\u1e70\u1e72\u1e74\u1e76\u1e78\u1e7a\u1e7c\u1e7e\u1e80\u1e82\u1e84\u1e86\u1e88\u1e8a\u1e8c\u1e8e\u1e90\u1e92\u1e94\u1e9e\u1ea0\u1ea2\u1ea4\u1ea6\u1ea8\u1eaa\u1eac\u1eae\u1eb0\u1eb2\u1eb4\u1eb6\u1eb8\u1eba\u1ebc\u1ebe\u1ec0\u1ec2\u1ec4\u1ec6\u1ec8\u1eca\u1ecc\u1ece\u1ed0\u1ed2\u1ed4\u1ed6\u1ed8\u1eda\u1edc\u1ede\u1ee0\u1ee2\u1ee4\u1ee6\u1ee8\u1eea\u1eec\u1eee\u1ef0\u1ef2\u1ef4\u1ef6\u1ef8\u1efa\u1efc\u1efe\u1f08-\u1f0f\u1f18-\u1f1d\u1f28-\u1f2f\u1f38-\u1f3f\u1f48-\u1f4d\u1f59\u1f5b\u1f5d\u1f5f\u1f68-\u1f6f\u1fb8-\u1fbb\u1fc8-\u1fcb\u1fd8-\u1fdb\u1fe8-\u1fec\u1ff8-\u1ffb\u2102\u2107\u210b-\u210d\u2110-\u2112\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u2130-\u2133\u213e-\u213f\u2145\u2183\u2c00-\u2c2e\u2c60\u2c62-\u2c64\u2c67\u2c69\u2c6b\u2c6d-\u2c70\u2c72\u2c75\u2c7e-\u2c80\u2c82\u2c84\u2c86\u2c88\u2c8a\u2c8c\u2c8e\u2c90\u2c92\u2c94\u2c96\u2c98\u2c9a\u2c9c\u2c9e\u2ca0\u2ca2\u2ca4\u2ca6\u2ca8\u2caa\u2cac\u2cae\u2cb0\u2cb2\u2cb4\u2cb6\u2cb8\u2cba\u2cbc\u2cbe\u2cc0\u2cc2\u2cc4\u2cc6\u2cc8\u2cca\u2ccc\u2cce\u2cd0\u2cd2\u2cd4\u2cd6\u2cd8\u2cda\u2cdc\u2cde\u2ce0\u2ce2\u2ceb\u2ced\u2cf2\ua640\ua642\ua644\ua646\ua648\ua64a\ua64c\ua64e\ua650\ua652\ua654\ua656\ua658\ua65a\ua65c\ua65e\ua660\ua662\ua664\ua666\ua668\ua66a\ua66c\ua680\ua682\ua684\ua686\ua688\ua68a\ua68c\ua68e\ua690\ua692\ua694\ua696\ua698\ua69a\ua722\ua724\ua726\ua728\ua72a\ua72c\ua72e\ua732\ua734\ua736\ua738\ua73a\ua73c\ua73e\ua740\ua742\ua744\ua746\ua748\ua74a\ua74c\ua74e\ua750\ua752\ua754\ua756\ua758\ua75a\ua75c\ua75e\ua760\ua762\ua764\ua766\ua768\ua76a\ua76c\ua76e\ua779\ua77b\ua77d-\ua77e\ua780\ua782\ua784\ua786\ua78b\ua78d\ua790\ua792\ua796\ua798\ua79a\ua79c\ua79e\ua7a0\ua7a2\ua7a4\ua7a6\ua7a8\ua7aa-\ua7ae\ua7b0-\ua7b4\ua7b6\ua7b8\uff21-\uff3a]/)
    ;

// * |// Mark, Spacing Combining
// * |Mc = [\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u1CF7\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]

const $Mc = factory
    // eslint-disable-next-line no-misleading-character-class
    .regExp(/^[\u0903\u093b\u093e-\u0940\u0949-\u094c\u094e-\u094f\u0982-\u0983\u09be-\u09c0\u09c7-\u09c8\u09cb-\u09cc\u09d7\u0a03\u0a3e-\u0a40\u0a83\u0abe-\u0ac0\u0ac9\u0acb-\u0acc\u0b02-\u0b03\u0b3e\u0b40\u0b47-\u0b48\u0b4b-\u0b4c\u0b57\u0bbe-\u0bbf\u0bc1-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcc\u0bd7\u0c01-\u0c03\u0c41-\u0c44\u0c82-\u0c83\u0cbe\u0cc0-\u0cc4\u0cc7-\u0cc8\u0cca-\u0ccb\u0cd5-\u0cd6\u0d02-\u0d03\u0d3e-\u0d40\u0d46-\u0d48\u0d4a-\u0d4c\u0d57\u0d82-\u0d83\u0dcf-\u0dd1\u0dd8-\u0ddf\u0df2-\u0df3\u0f3e-\u0f3f\u0f7f\u102b-\u102c\u1031\u1038\u103b-\u103c\u1056-\u1057\u1062-\u1064\u1067-\u106d\u1083-\u1084\u1087-\u108c\u108f\u109a-\u109c\u17b6\u17be-\u17c5\u17c7-\u17c8\u1923-\u1926\u1929-\u192b\u1930-\u1931\u1933-\u1938\u1a19-\u1a1a\u1a55\u1a57\u1a61\u1a63-\u1a64\u1a6d-\u1a72\u1b04\u1b35\u1b3b\u1b3d-\u1b41\u1b43-\u1b44\u1b82\u1ba1\u1ba6-\u1ba7\u1baa\u1be7\u1bea-\u1bec\u1bee\u1bf2-\u1bf3\u1c24-\u1c2b\u1c34-\u1c35\u1ce1\u1cf2-\u1cf3\u1cf7\u302e-\u302f\ua823-\ua824\ua827\ua880-\ua881\ua8b4-\ua8c3\ua952-\ua953\ua983\ua9b4-\ua9b5\ua9ba-\ua9bb\ua9bd-\ua9c0\uaa2f-\uaa30\uaa33-\uaa34\uaa4d\uaa7b\uaa7d\uaaeb\uaaee-\uaaef\uaaf5\uabe3-\uabe4\uabe6-\uabe7\uabe9-\uabea\uabec]/)
    ;

// * |// Mark, Nonspacing
// * |Mn = [\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u09FE\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C04\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D00-\u0D01\u0D3B-\u0D3C\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885-\u1886\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]

const $Mn = factory
    .regExp(/^[\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7-\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0902\u093a\u093c\u0941-\u0948\u094d\u0951-\u0957\u0962-\u0963\u0981\u09bc\u09c1-\u09c4\u09cd\u09e2-\u09e3\u09fe\u0a01-\u0a02\u0a3c\u0a41-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a70-\u0a71\u0a75\u0a81-\u0a82\u0abc\u0ac1-\u0ac5\u0ac7-\u0ac8\u0acd\u0ae2-\u0ae3\u0afa-\u0aff\u0b01\u0b3c\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b62-\u0b63\u0b82\u0bc0\u0bcd\u0c00\u0c04\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c62-\u0c63\u0c81\u0cbc\u0cbf\u0cc6\u0ccc-\u0ccd\u0ce2-\u0ce3\u0d00-\u0d01\u0d3b-\u0d3c\u0d41-\u0d44\u0d4d\u0d62-\u0d63\u0dca\u0dd2-\u0dd4\u0dd6\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb-\u0ebc\u0ec8-\u0ecd\u0f18-\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039-\u103a\u103d-\u103e\u1058-\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108d\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17b4-\u17b5\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u1885-\u1886\u18a9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193b\u1a17-\u1a18\u1a1b\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1ab0-\u1abd\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80-\u1b81\u1ba2-\u1ba5\u1ba8-\u1ba9\u1bab-\u1bad\u1be6\u1be8-\u1be9\u1bed\u1bef-\u1bf1\u1c2c-\u1c33\u1c36-\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1cf4\u1cf8-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302d\u3099-\u309a\ua66f\ua674-\ua67d\ua69e-\ua69f\ua6f0-\ua6f1\ua802\ua806\ua80b\ua825-\ua826\ua8c4-\ua8c5\ua8e0-\ua8f1\ua8ff\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\ua9e5\uaa29-\uaa2e\uaa31-\uaa32\uaa35-\uaa36\uaa43\uaa4c\uaa7c\uaab0\uaab2-\uaab4\uaab7-\uaab8\uaabe-\uaabf\uaac1\uaaec-\uaaed\uaaf6\uabe5\uabe8\uabed\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f]/)
    ;

// * |// Number, Decimal Digit
// * |Nd = [\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]

const $Nd = factory
    .regExp(/^[0-9\u0660-\u0669\u06f0-\u06f9\u07c0-\u07c9\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0b66-\u0b6f\u0be6-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f\u0de6-\u0def\u0e50-\u0e59\u0ed0-\u0ed9\u0f20-\u0f29\u1040-\u1049\u1090-\u1099\u17e0-\u17e9\u1810-\u1819\u1946-\u194f\u19d0-\u19d9\u1a80-\u1a89\u1a90-\u1a99\u1b50-\u1b59\u1bb0-\u1bb9\u1c40-\u1c49\u1c50-\u1c59\ua620-\ua629\ua8d0-\ua8d9\ua900-\ua909\ua9d0-\ua9d9\ua9f0-\ua9f9\uaa50-\uaa59\uabf0-\uabf9\uff10-\uff19]/)
    ;

// * |// Number, Letter
// * |Nl = [\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]

const $Nl = factory
    .regExp(/^[\u16ee-\u16f0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303a\ua6e6-\ua6ef]/)
    ;

// * |// Punctuation, Connector
// * |Pc = [\u005F\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]

const $Pc = factory
    .regExp(/^[_\u203f-\u2040\u2054\ufe33-\ufe34\ufe4d-\ufe4f\uff3f]/)
    ;

// * |// Separator, Space
// * |Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

const $Zs = factory
    .regExp(/^[ \u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/)
    ;

// * |// Skipped

// * |__
// * |  = (WhiteSpace / LineTerminatorSequence / Comment)*

const $__ = factory
    .zeroOrMore(r => r
        .choice(c => c
            .or(r => r
                .ref(() => $WhiteSpace)
            )
            .or(r => r
                .ref(() => $LineTerminatorSequence)
            )
            .or(r => r
                .ref(() => $Comment)
            )
        )
    )
    ;

// * |_
// * |  = (WhiteSpace / MultiLineCommentNoLineTerminator)*

const $_ = factory
    .zeroOrMore(r => r
        .choice(c => c
            .or(r => r
                .ref(() => $WhiteSpace)
            )
            .or(r => r
                .ref(() => $MultiLineCommentNoLineTerminator)
            )
        )
    )
    ;

// * |// Automatic Semicolon Insertion

// * |EOS
// * |  = __ ";"
// * |  / _ SingleLineComment? LineTerminatorSequence
// * |  / __ EOF

const $EOS = factory
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .ref(() => $__)
                )
                .and(r => r
                    .seqEqual(";")
                )
            )
        )
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .ref(() => $_)
                )
                .and(r => r
                    .zeroOrOne(r => r
                        .ref(() => $SingleLineComment)
                    )
                )
                .and(r => r
                    .ref(() => $LineTerminatorSequence)
                )
            )
        )
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .ref(() => $__)
                )
                .and(r => r
                    .ref(() => $EOF)
                )
            )
        )
    )
    ;

// * |EOF
// * |  = !.

const $EOF = factory
    .nextIsNot(r => r
        .anyOne()
    )
    ;

const rules = {
    Grammar: $Grammar,
    Initializer: $Initializer,
    Rule: $Rule,
    Expression: $Expression,
    ChoiceExpression: $ChoiceExpression,
    ActionExpression: $ActionExpression,
    SequenceExpression: $SequenceExpression,
    LabeledExpression: $LabeledExpression,
    LabelIdentifier: $LabelIdentifier,
    PrefixedExpression: $PrefixedExpression,
    PrefixedOperator: $PrefixedOperator,
    SuffixedExpression: $SuffixedExpression,
    SuffixedOperator: $SuffixedOperator,
    PrimaryExpression: $PrimaryExpression,
    RuleReferenceExpression: $RuleReferenceExpression,
    SemanticPredicateExpression: $SemanticPredicateExpression,
    SemanticPredicateOperator: $SemanticPredicateOperator,
    SourceCharacter: $SourceCharacter,
    WhiteSpace: $WhiteSpace,
    LineTerminator: $LineTerminator,
    LineTerminatorSequence: $LineTerminatorSequence,
    Comment: $Comment,
    MultiLineComment: $MultiLineComment,
    MultiLineCommentNoLineTerminator: $MultiLineCommentNoLineTerminator,
    SingleLineComment: $SingleLineComment,
    Identifier: $Identifier,
    IdentifierStart: $IdentifierStart,
    IdentifierPart: $IdentifierPart,
    UnicodeLetter: $UnicodeLetter,
    UnicodeCombiningMark: $UnicodeCombiningMark,
    UnicodeDigit: $UnicodeDigit,
    UnicodeConnectorPunctuation: $UnicodeConnectorPunctuation,
    LiteralMatcher: $LiteralMatcher,
    StringLiteral: $StringLiteral,
    DoubleStringCharacter: $DoubleStringCharacter,
    SingleStringCharacter: $SingleStringCharacter,
    CharacterClassMatcher: $CharacterClassMatcher,
    CharacterPart: $CharacterPart,
    ClassCharacterRange: $ClassCharacterRange,
    ClassCharacter: $ClassCharacter,
    LineContinuation: $LineContinuation,
    EscapeSequence: $EscapeSequence,
    CharacterEscapeSequence: $CharacterEscapeSequence,
    SingleEscapeCharacter: $SingleEscapeCharacter,
    NonEscapeCharacter: $NonEscapeCharacter,
    EscapeCharacter: $EscapeCharacter,
    HexEscapeSequence: $HexEscapeSequence,
    UnicodeEscapeSequence: $UnicodeEscapeSequence,
    DecimalDigit: $DecimalDigit,
    HexDigit: $HexDigit,
    AnyMatcher: $AnyMatcher,
    CodeBlock: $CodeBlock,
    Code: $Code,
    Ll: $Ll,
    Lm: $Lm,
    Lo: $Lo,
    Lt: $Lt,
    Lu: $Lu,
    Mc: $Mc,
    Mn: $Mn,
    Nd: $Nd,
    Nl: $Nl,
    Pc: $Pc,
    Zs: $Zs,
    __: $__,
    _: $_,
    EOS: $EOS,
    EOF: $EOF,
};
type Rules = typeof rules;

export const parse = <TRuleKey extends (keyof Rules) = "Grammar">(text: string, options: {startRule?: TRuleKey} & Record<string | number | symbol, unknown>): ValueOfRule<Rules[TRuleKey]> => {
    let rule: ValueRule<unknown> = $Grammar;
    if ("startRule" in options) {
        rule = rules[options.startRule as keyof typeof rules];
    }
    const result = rule.match(
        0,
        text,
        initializer(options),
    );
    if (result.ok) return result.value as ValueOfRule<Rules[TRuleKey]>;
    throw new Error(`Expected ${result.expected} ${JSON.stringify(result)}`);
};

export const defaultOptions = {
    reservedWords: [

        // Keyword
        "break",
        "case",
        "catch",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",

        // FutureReservedWord
        "class",
        "const",
        "enum",
        "export",
        "extends",
        "implements",
        "import",
        "interface",
        "let",
        "package",
        "private",
        "protected",
        "public",
        "static",
        "super",
        "yield",

        // Literal
        "false",
        "null",
        "true",
    ],
    extractComments: true,
};
